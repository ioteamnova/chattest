'use client'
import Image from 'next/image'
import React, { useState, useRef, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import ChatItem from '../../components/chat/ChatItem';
import axios from 'axios';

interface IMessage {
  userIdx: number;
  socketId: string;
  message: string;
  room: string;
}
interface DMessage {
  userIdx: number;
  score: number;
  room: string;
}
interface userInfo {
  userIdx: number;
  profilePath: string;
  nickname: string;
};

export default function NewPage() {
  const [roomEnter, setroomEnter] = useState<boolean>(false);
  const [biddingState, setbiddingState] = useState<boolean>(false);
  const [textMsg, settextMsg] = useState('');
  const [roomName, setroomName] = useState('');
  const [userIdx, setUserIdx] = useState<number>(); // 유저의 userIdx 저장
  const [chattingData, setchattingData] = useState<IMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);
  let auctionRoomIdx = useRef<string>();
  const [userInfoData, setUserInfoData] = useState({});

  const onChangeKeyword = (event: { target: { value: string; }; }) => {
    const numericInput = event.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    settextMsg(numericInput);
  };

  const onChangeRoom = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setroomName(value);
  }, []);
  const onChangeUserIdx = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setUserIdx(parseInt(value));
  }, []);

  useEffect(() => {
    console.log(roomName);
    auctionRoomIdx.current = roomName;
    }, [roomName])

    useEffect(() => {
      if(userInfoData[userIdx]){
        setbiddingState(true);
      }
      }, [userInfoData])

      useEffect(() => {
        console.log(biddingState);
        }, [biddingState])
    //서버에 채팅 내역을 불러오는 요청 - 20개씩 불러온다.
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3003/auctionChat/${auctionRoomIdx.current}?page=1&size=20&order=DESC`);
        const userInfoArray = response.data.result.userInfo;
        const resultData = response.data.result.list;
        const userInfoData = userInfoArray.map((user: string) => {
          const { userIdx, profilePath, nickname } = JSON.parse(user);
          return { [userIdx]: { userIdx, profilePath, nickname } };
        });
        const userDataObject = Object.assign({}, ...userInfoData);
        setUserInfoData(userDataObject);
        const messages: IMessage[] = resultData.map((item: any) => ({
          userIdx: item.userIdx,
          socketId: item.socketId,
          message: item.message,
          room: item.room,
        })).reverse();
        setchattingData(messages);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    const fetchParticipate = async () => {
      try {
        // 참여자 명단 추가 -> 나중에 jwt토큰 완성되면 userIdx 빼주시면 됩니다. userId는 jwt토큰으로 조회 가능합니다.
        await axios.post(`http://localhost:3003/AuctionChat/bid`, {
          auctionIdx: roomName,
          userIdx: userIdx,
        });

         // 알람 받기 On 요청 -> 나중에 jwt토큰 완성되면 userIdx 빼주시면 됩니다. userId는 jwt토큰으로 조회 가능합니다.
        await axios.post(`http://localhost:3003/AuctionChat/${roomName}`, {
          action: 'on',
          userIdx: userIdx,
        });

        //메시지 발송
        if(socketRef.current){
          const message = {
            userIdx: parseInt(userIdx),
            profilePath: 'test',
            nickname: 'nickname',
            room: roomName,
          };
          socketRef.current.emit("auction_participate", message);
          settextMsg("");
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

  //메시지 발송하는 함수
  const sendMsg = async () => {
    if (textMsg.trim() !== "") {
      if(!biddingState){
        await fetchParticipate();
      }
      if(socketRef.current){
        const socketId = socketRef.current.id;
        const message: IMessage = {
          userIdx: parseInt(userIdx),
          socketId: socketId,
          message: textMsg.trim(),
          room: roomName,
        };
        socketRef.current.emit("Auction_message", message);
        settextMsg("");
      }
      
      
    }
  }
  const roomOut = () => {
    setroomEnter(false);
    setchattingData([]);
  }
  //방에 들어왔을 때 작동하는 함수
  const joinRoom = () => {
    const socket = io('http://localhost:3003/AuctionChat', {
      path: '/socket.io',
    });
    // log socket connection
    socketRef.current = socket;
    socket.on("connect", () => {
      const message: IMessage = {
        userIdx: parseInt(userIdx, 10),
        socketId: socket.id,
        message: textMsg.trim(),
        room: roomName,
      };
      
      if(socketRef.current){
        socketRef.current.emit("join-room", message);
      }
      setroomEnter(true);
     
      fetchData();
    });

    // 메시지 리스너
    socket.on("Auction_message", (message: IMessage) => {
      setchattingData(chattingData => [...chattingData, message]);
      console.log('message', message);
    });

    socket.on("Auction_End", (message: string) => {
      console.log('Auction_End message', message);
      
    });
    //경매 입찰과 동시에 입찰자 명단 정보를 추가하는 리스너
    socket.on("auction_participate", (message: userInfo) => {
      setUserInfoData((prevUserInfoData) => ({
        ...prevUserInfoData,
        [message.userIdx]: {
          userIdx: message.userIdx,
          profilePath: message.profilePath,
          nickname: message.nickname,
        },
      }));
    });
    // socket disconnect on component unmount if exists 
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }

  return (
    <>
    <div className="p-8 bg-gray-100 min-h-screen w-1000" style={{width:'60%'}}>
      <h1 className="text-4xl font-bold text-gray-800 mb-4">경매 채팅</h1>
      <div className="flex items-start space-x-4">
        <div className="flex-1">
          <div className="flex-1 min-h-[25vh] overflow-auto bg-white" style={{height:'300px'}}>
            {chattingData.map((chatData, i) => (
              <ChatItem chatData={chatData} userIdx={userIdx}  userInfoData={userInfoData[chatData.userIdx]} key={i} />
            ))}
          </div>
        </div>
  
        <div className="flex flex-col flex-1 space-y-2">
          <input
            className="w-full h-12 px-4 py-2 border border-gray-300 rounded"
            value={textMsg}
            onChange={onChangeKeyword}
            placeholder="보낼 메시지, 숫자만 입력 가능합니다."
          />
            <button
           className="w-full h-12 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
            onClick={sendMsg}
            style={{ backgroundColor: '#7A75F7' }}
          >
            보내기
          </button>
          <input
            className="w-full h-12 px-4 py-2 border border-gray-300 rounded"
            value={roomName}
            onChange={onChangeRoom}
            placeholder="참여할 방 번호"
          />
          <input
            className="w-full h-12 px-4 py-2 border border-gray-300 rounded"
            value={userIdx}
            onChange={onChangeUserIdx}
            placeholder="참여할 유저 번호"
          />
          {roomEnter === true ? 
            <button
              className="w-full h-12 bg-red-500 text-white rounded hover:bg-red-600 transition"
              onClick={roomOut}
            >
              방 나가기
            </button> :
            <button
            className="w-full h-12 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={joinRoom}
            style={{ backgroundColor: '#7A75F7' }}
            >
              방 참여
            </button>
          }
          
  
        </div>
      </div>
      <div className="flex items-start space-x-4 mt-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">기타 기능</h1>
          <div className="flex-1 overflow-auto bg-white mt-6" style={{height:'300px', width:"300px"}}>
            {Object.values(userInfoData).map((userData) => (
              <div className="flex" key={userData.userIdx}>
                <div>{userData.userIdx}</div>
                <div>: </div>
                <div>{userData.nickname}</div>
              </div>
            ))}
            </div>
          </div>
      </div>
    </div>
  </>
  )
}

