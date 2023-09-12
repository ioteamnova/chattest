'use client'
import React, {useState,forwardRef,useRef, useEffect} from 'react';
import Swal from 'sweetalert2';

const BanUserList = forwardRef((props, ref) =>{
	const [boxState, setBoxState] = useState(false);// 옵션 박스 상태
	const [SwalOn, setSwalOn] = useState(false); //알림 모달창 유무
	const wrapperRef = useRef();
	console.log(props.userList);
	useEffect(()=>{
        document.addEventListener('mouseup', handleClickOutside);
        return()=>{
			if(boxState === true){
				document.removeEventListener('mouseup', handleClickOutside);
			}
        }
      })
	const modalOnOff = (category) => {
		if(props.userAuth !== 'host'){
			Swal.fire({
				text:'방장이 아닙니다.',
				icon: 'error',
				confirmButtonText: '완료', // confirm 버튼 텍스트 지정
				confirmButtonColor: '#7A75F7', // confrim 버튼 색깔 지정
			  });
			return;
		}
		if(SwalOn === false){
			setSwalOn(true);
			let title = '';
			let text = '';
			if(category === 'ben'){
				title = `${props.nickname}님을 강제 퇴장 시키겠습니까?`;
				text = '강퇴 후, 해당 라이브 방송은 재입장이 불가능합니다.';
			}else if(category === 'noChat'){
				title = `${props.nickname}님을 채팅 금지 시키겠습니까?`;
				text = '채팅 금지 후, 해당 라이브 방송에서 채팅이 불가능합니다.';
			}
			Swal.fire({
				title: title,
				text: text,
				icon: 'warning',
		
				showCancelButton: true, // cancel버튼 보이기. 기본은 원래 없음
				confirmButtonColor: '#426BFA', // confrim 버튼 색깔 지정
				cancelButtonColor: '#d33', // cancel 버튼 색깔 지정
				confirmButtonText: '삭제', // confirm 버튼 텍스트 지정
				cancelButtonText: '취소', // cancel 버튼 텍스트 지정
				cancelButtonSize:'30px',
				
			  }).then(result => {// 만약 Promise리턴을 받으면,
				if (result.isConfirmed) { // 만약 모달창에서 confirm 버튼을 눌렀다면
					if(category === 'ben'){
						props.ban(props.userList.userIdx);
					}
				}
				setSwalOn(false);
			  });
		}
    }
	const optionBoxOnOff = () => {
		if(boxState === false){
			setBoxState(true);
		}
    }
	const handleClickOutside=(event)=>{
		if (boxState === true && wrapperRef.current &&  SwalOn === false && !wrapperRef.current.contains(event.target)) {
			setBoxState(false);
		}
	}
    return (
		<div className="flex" key={props.userList.idx} style={{cursor:"pointer"}} onClick={optionBoxOnOff} >
			<div>{props.userList.idx}</div>
				<div>: </div>
			<div>{props.userList.nickname}</div>
			{boxState === true ?
			<div style={{position:"absolute",marginTop:"20px",borderRadius:"10px", border:"solid 1px", backgroundColor:"#e5e7eb", width:"100px", height:"30px"}} ref={wrapperRef}>
				<div style={{display:"flex",alignItems:"center", justifyContent:"center", fontWeight:"bold",}} onClick={() => props.fetchBanDelete(props.userList.idx)}><h1>차단 해제</h1></div>
			</div>
			:
			""}
		</div>
    );
});
BanUserList.displayName = 'BanUserList';
export default BanUserList;