'use client'
import Image from 'next/image'
import React, { useState, useRef, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import ChatItem from '../../components/chat/ChatItem';
import ChatUserList from '../../components/chat/ChatUserList';
import BanUserList from '../../components/chat/BanUserList';
import axios from 'axios';
import Swal from 'sweetalert2';

interface IMessage {
  userIdx: number;
  socketId: string;
  message: string;
  room: string;
}
interface connectMessage {
  userIdx: number;
  socketId: string;
  message: string;
  room: string;
  profilePath: string;
  nickname: string;
}
interface Ban_Message {
  userIdx: number;
  banUserIdx: number;
  room: string;
  boardIdx: number,
}
interface userInfo {
  userIdx: number;
  profilePath: string;
  nickname: string;
};

export default function NewPage() {
  const [roomEnter, setroomEnter] = useState<boolean>(false);
  const [textMsg, settextMsg] = useState('');
  const [roomName, setroomName] = useState('');
  const [userIdx, setUserIdx] = useState<number>(); // 유저의 userIdx 저장
  const [chattingData, setchattingData] = useState<IMessage[]>([]);
  const [banList, setBanList] = useState<userInfo[]>([]);
  const [noChatList, setNoChatList] = useState<userInfo[]>([]);
  const socketRef = useRef<Socket | null>(null);
  let liveRoomIdx = useRef<string>();
  const [userInfoData, setUserInfoData] = useState({});//유저 정보 가지고 있는 리스트
  const [userList, setUserList] = useState({});//현재 참자여 목록
  const [host, setHost] = useState(77);//방장 유무: 현재 하드코딩 -> 나중에 방 입장 시, props로 들고와야함
  const [boardIdx, setBoardIdx] = useState(279);//게시글 번호: 현재 하드코딩 -> 나중에 방 입장 시, props로 들고와야함
  const [userAuth, setUserAuth] = useState('guest');//유저 권한
  const [noChatState, setNoChatState] = useState<boolean>(false);//유저 권한

  const onChangeKeyword = (e: { target: { value: string; }; }) => {
    const newValue = e.target.value;
    settextMsg(newValue);
  };
  
  const roomOut = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room', {
        userIdx: userIdx,
        roomIdx: roomName
      });
      socketRef.current.disconnect();
    }
    setroomEnter(false);
    setchattingData([]);
    setUserList({});
    setNoChatState(false);
    setUserAuth('guest');
  }, [socketRef, userIdx, roomName]);

  const onChangeRoom = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setroomName(newValue);
  }, []);
  const onChangeUserIdx = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setUserIdx(parseInt(value));
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: { preventDefault: () => void; returnValue: string; }) => {
      roomOut();
      event.preventDefault();
      event.returnValue = ''; // Some browsers require this property to be set.
    };

    // beforeunload 이벤트 리스너를 등록합니다.
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // 컴포넌트가 언마운트 될 때 이벤트 리스너를 제거합니다.
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomOut])

  useEffect(() => {
    console.log(roomName);
    liveRoomIdx.current = roomName;
    }, [roomName])
   
    useEffect(() => {
      console.log('banList', banList);
    }, [banList])
    
    //강퇴 시키기
    const ban = (banUserIdx: number) => {
      if(userAuth === 'host'){
        if(socketRef.current){
          const message: Ban_Message = {
            userIdx: parseInt(userIdx),
            banUserIdx: banUserIdx,
            room: roomName,
            boardIdx: boardIdx,
          };
          socketRef.current.emit("user_ban", message);
        }
      }
    }
    //채팅 금지 먹이기
    const noChat = (banUserIdx: number) => {
      console.log('noChat');
      if(userAuth === 'host'){
        console.log(socketRef.current);
        if(socketRef.current){
          console.log('noChat');
          const message: Ban_Message = {
            userIdx: parseInt(userIdx),
            banUserIdx: banUserIdx,
            room: roomName,
            boardIdx: boardIdx,
          };
          socketRef.current.emit("noChat", message);
        }
      }
    }
    //채팅 금지 풀기
    const noChatDelete = (banUserIdx: number) => {
      if(userAuth === 'host'){
        console.log(socketRef.current);
        if(socketRef.current){
          console.log('noChat');
          const message: Ban_Message = {
            userIdx: parseInt(userIdx),
            banUserIdx: banUserIdx,
            room: roomName,
            boardIdx: boardIdx,
          };
          socketRef.current.emit("noChatDelete", message);
        }
      }
    }
    //밴 목록 조회
    const fetchBanList = async () => {
      if(userAuth === 'host'){
        try {
          const response = await axios.get(`http://localhost:3003/LiveChat/ban/${roomName}/${boardIdx}/${userIdx}`);
          const userInfoArray = response.data.result;
          setBanList(userInfoArray);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }else {
        Swal.fire({
          text:'방장이 아닙니다.',
          icon: 'error',
          confirmButtonText: '완료', // confirm 버튼 텍스트 지정
          confirmButtonColor: '#7A75F7', // confrim 버튼 색깔 지정
        });
      }
    };
    //밴 풀기
    const fetchBanDelete = async (banUserIdx: number) => {
      if(userAuth === 'host'){
          await axios.post(`http://localhost:3003/LiveChat/ban/${roomName}/${boardIdx}/${userIdx}/${banUserIdx}`);
      }else {
        Swal.fire({
          text:'방장이 아닙니다.',
          icon: 'error',
          confirmButtonText: '완료', // confirm 버튼 텍스트 지정
          confirmButtonColor: '#7A75F7', // confrim 버튼 색깔 지정
        });
      }
    };
    //채금 목록 조회
    const fetchNoChatList = async () => {
      if(userAuth === 'host'){
        console.log('no chat');
        try {
          const response = await axios.get(`http://localhost:3003/LiveChat/nochat/${roomName}/${boardIdx}/${userIdx}`);
          const userInfoArray = response.data.result;
          setNoChatList(userInfoArray);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }else {
        Swal.fire({
          text:'방장이 아닙니다.',
          icon: 'error',
          confirmButtonText: '완료', // confirm 버튼 텍스트 지정
          confirmButtonColor: '#7A75F7', // confrim 버튼 색깔 지정
        });
      }
    };

    // //채금 풀기
    // const fetchnoChatDelete = async (banUserIdx: number) => {
    //   if(userAuth === 'host'){
    //       await axios.post(`http://localhost:3003/LiveChat/noChat/${roomName}/${boardIdx}/${userIdx}/${banUserIdx}`);
    //   }else {
    //     Swal.fire({
    //       text:'방장이 아닙니다.',
    //       icon: 'error',
    //       confirmButtonText: '완료', // confirm 버튼 텍스트 지정
    //       confirmButtonColor: '#7A75F7', // confrim 버튼 색깔 지정
    //     });
    //   }
    // };

  //메시지 발송하는 함수
  const sendMsg = async () => {
    if (textMsg.trim() === "") {
      return;
    }
    if(noChatState === true){
      Swal.fire({
        text:'채팅 금지 상태입니다.',
        icon: 'warning',
        confirmButtonText: '완료', // confirm 버튼 텍스트 지정
        confirmButtonColor: '#7A75F7', // confrim 버튼 색깔 지정
      });
      return;
    }

    if(socketRef.current){
      const socketId = socketRef.current.id;
      const message: IMessage = {
        userIdx: parseInt(userIdx),
        socketId: socketId,
        message: textMsg.trim(),
        room: roomName,
      };
      socketRef.current.emit("live_message", message);
      settextMsg("");
    } 
    
  }
 
  //방에 들어왔을 때 작동하는 함수
  const joinRoom = () => {
    const socket = io('http://localhost:3003/LiveChat', {
      path: '/socket.io',
    });
    // log socket connection
    socketRef.current = socket;
    socket.on("connect", () => {
      const message: connectMessage = {
        userIdx: parseInt(userIdx, 10),
        socketId: socket.id,
        message: textMsg.trim(),
        room: roomName,
        profilePath: 'testProfilePath',
        nickname: 'testNickName',
      };
      if(socketRef.current){
        socketRef.current.emit("join-live", message);
      }
      setroomEnter(true);
    });

    // 메시지 리스너
    socket.on("live_message", (message: IMessage) => {
      console.log(message);
      
      setchattingData(chattingData => [...chattingData, message]);
    });
    //강퇴 처리
    socket.on("ban-user", (message: IMessage) => {
      if(message.userIdx === userIdx){
        roomOut();
        Swal.fire({
          text:'방송에서 추방 당했습니다.',
          icon: 'warning',
          confirmButtonText: '완료', // confirm 버튼 텍스트 지정
          confirmButtonColor: '#7A75F7', // confrim 버튼 색깔 지정
        });
      }else{
        setUserList(prevUserList => {
          const newData = { ...prevUserList };
          delete newData[message.userIdx];
          return newData;
        });
      }
      setroomEnter(false);
    });
    //강퇴 당한 이후에 재입장 시도 후 밴 유무를 알리는 리스너
    socket.on("ban-notification", (message: string) => {
      setroomEnter(false);
      Swal.fire({
        text:'해당 방송 입장 금지를 당하셨습니다.',
        icon: 'error',
        confirmButtonText: '완료', // confirm 버튼 텍스트 지정
        confirmButtonColor: '#7A75F7', // confrim 버튼 색깔 지정
      });
    });
    //다른 참여자가 방을 나갔을 때
    socket.on("leave-user", (message: IMessage) => {
      console.log('message', message);
      
      setUserList(prevUserList => {
        const newData = { ...prevUserList };
        delete newData[message.userIdx];
        return newData;
      });
    });
    //채팅 금지 리스너
    socket.on("no_chat", (message: string) => {
      console.log("noChatIdx");
      Swal.fire({
        text:'채팅 금지를 받았습니다.',
        icon: 'warning',
        confirmButtonText: '완료', // confirm 버튼 텍스트 지정
        confirmButtonColor: '#7A75F7', // confrim 버튼 색깔 지정
      });
      setNoChatState(true);
    });
    //채팅 금지 해제 리스너
    socket.on("no_chat_delete", (message: IMessage) => {
      if(message.userIdx === userIdx){
        setNoChatState(false);
      }
    });
    //참여자 정보를 추가하는 리스너
    socket.on("live_participate", (message: string[]) => {
      if(userIdx === host){
        setUserAuth('host');
      }
      for (const data of message) {
        const getUserInfo = JSON.parse(data);
        setUserInfoData((prevUserInfoData) => ({
          ...prevUserInfoData,
          [getUserInfo.userIdx]: {
            userIdx: getUserInfo.userIdx,
            profilePath: getUserInfo.profilePath,
            nickname: getUserInfo.nickname,
          },
        }));
        setUserList((prevsetUserList) => ({
          ...prevsetUserList,
          [getUserInfo.userIdx]: {
            userIdx: getUserInfo.userIdx,
            profilePath: getUserInfo.profilePath,
            nickname: getUserInfo.nickname,
          },
        }));
      };
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
      <h1 className="text-4xl font-bold text-gray-800 mb-4">라이브 스트리밍 채팅</h1>
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
            onChange={onChangeKeyword}
            value={textMsg} 
            placeholder="최대 100자까지만."
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
            placeholder="참여할 라이브방 번호"
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
      <div >
        <h1 className="text-2xl font-bold text-gray-800 mt-6">기타 기능</h1>
        <div className="flex">
          <div>
            <h2 className='mt-6'>참여자 목록▼</h2>
            <div className="flex-1 overflow-auto bg-white  mt-2" style={{height:'300px', width:"200px"}}>
              {Object.values(userList).map((userList) => (
                <ChatUserList key={userList.userIdx} userList={userList} ban = {ban} noChat = {noChat} userAuth = {userAuth}/>
              ))}
              </div>
            </div>
            {userAuth === 'host' ?  
              <div className='ml-6'>
                <div className='flex mt-6' style={{justifyContent:"center",alignItems:"center",}}>
                  <h3>밴 목록(방장만)▼</h3>
                  <button onClick={fetchBanList} className='bg-blue-500 text-white rounded p-1' style={{height:"24px", fontSize:"12px", backgroundColor:"#7A75F7"}}>새로고침</button>
                </div>
                <div className="flex-1 overflow-auto bg-white  mt-2" style={{height:'300px', width:"200px"}}>
                {banList.map((info) => (
                  <BanUserList key={info.userIdx} userList={info} userAuth = {userAuth} fetchBanDelete = {fetchBanDelete}/>
                ))}
                </div>
              </div> 
              : ""
              } 
              {userAuth === 'host' ? 
              <div className='ml-6'>
                <div className='flex mt-6' style={{justifyContent:"center",alignItems:"center",}}>
                  <h3>채금 목록(방장만)▼</h3>
                  <button onClick={fetchNoChatList} className='bg-blue-500 text-white rounded p-1' style={{height:"24px", fontSize:"12px", backgroundColor:"#7A75F7"}}>새로고침</button>
                </div>
                <div className="flex-1 overflow-auto bg-white  mt-2" style={{height:'300px', width:"200px"}}>
                  {noChatList.map((info) => (
                    <BanUserList key={info.userIdx} userList={info} userAuth = {userAuth} fetchBanDelete = {noChatDelete}/>
                  ))}
                </div>
              </div> : ""
              }
        </div>
      </div>
    </div>
  </>
  )
}

