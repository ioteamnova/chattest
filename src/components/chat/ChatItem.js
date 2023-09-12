'use client'
import React, {useState,forwardRef,useImperativeHandle, useEffect} from 'react';
const ChatItem = forwardRef((props, ref) =>{
	let loginUserId = 1;
	let [backgroundColor, setbackgroundColor] = useState('');
	useImperativeHandle(ref, () => ({
		
	}));
    return (
		<div>
			{props.chatData.userIdx !=  props.userIdx ? 
				<div id="outer" style={{display:"flex",maxWidth:"280px",marginTop:"12px",paddingLeft:"10px"}}>
					{props.userInfoData.profilePath !==  undefined || null ? 
						<img src={props.userInfoData.profilePath} alt ="face" style={{borderRadius: "80px", objectFit: "cover", cursor:"Pointer", width:"45px", height:"45px"}}/>
					: ''}
					<div style={{borderRadius:"20px",maxWidth:"220px", backgroundColor:"#e4e6eb",marginLeft:"10px",padding:"10px"}}> 
						<div style={{fontSize:"15px",wordBreak:"break-all"}}>{props.chatData.message}</div>
					</div>
				</div>
				:
				<div id="outer" style={{maxWidth:"250px",marginTop:"12px", marginLeft:"auto",display: "flex",justifyContent: "flex-end"}}>
					<div style={{display:"flex",marginLeft:"auto"}}>
						{props.chatData.readCnt === '0' ? 
							''
							:
							<p style={{marginRight:"10px",marginTop:"15px",}}>{props.chatData.readCnt}</p>
						}
						<div style={{marginLeft:"auto",borderRadius:"20px",backgroundColor:"#7A75F7",padding:"10px",}}> 
							<div style={{fontSize:"15px", wordBreak:"break-all", color:'white',textAlign:"left"}}>{props.chatData.message}</div>
						</div>
					</div>
					
				</div>
			}
		</div>
    );
});
ChatItem.displayName = 'ChatItem';
export default ChatItem;