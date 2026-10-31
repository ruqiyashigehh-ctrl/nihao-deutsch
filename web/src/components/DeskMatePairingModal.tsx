import React,{useState} from 'react';
import { Modal } from 'antd';
import type {ClassmateItem,PairingMethod} from '../types/domain';
import {Loading} from './Loading';
import {EmptyState} from './EmptyState';
interface DeskMatePairingModalProps {open:boolean;classmates:ClassmateItem[];loading:boolean;onClose:()=>void;onPair:(method:PairingMethod)=>Promise<{success:boolean;message:string}>;}
export const DeskMatePairingModal:React.FC<DeskMatePairingModalProps>=({open,classmates,loading,onClose,onPair})=>{
 const [code,setCode]=useState('');const [result,setResult]=useState<{success:boolean;message:string}|null>(null);
 const handlePairByCode=async()=>{if(!code.trim())return;const res=await onPair({kind:'code',code:code.trim()});setResult(res);if(res.success)setCode('');};
 const handlePairByClassmate=async(classmateId:string)=>setResult(await onPair({kind:'classmate',classmateId}));
 return <Modal title="同桌组队" open={open} onCancel={onClose} footer={null} width={440}><p className="paper-description" style={{marginBottom:20}}>找一位同学，互相提醒，一起坚持。</p>{result&&<p role="status" style={{background:result.success?'#e8eddf':'#f3e5dc',color:result.success?'#43654e':'#a34334',padding:12,borderRadius:6,marginBottom:16}}>{result.message}</p>}<label htmlFor="deskmate-code" style={{display:'block',fontSize:13,marginBottom:8}}>输入邀请码</label><div style={{display:'flex',gap:8,marginBottom:24}}><input className="paper-input" id="deskmate-code" value={code} onChange={e=>setCode(e.target.value)} placeholder="6 位邀请码" maxLength={6} style={{flex:1,minWidth:0}} /><button className="paper-button paper-button--primary" onClick={handlePairByCode}>组队</button></div><h3 style={{fontSize:14,fontWeight:550,marginBottom:12}}>同班同学</h3>{loading?<Loading />:classmates.length===0?<EmptyState message="暂无同班同学" />:<div style={{maxHeight:'40vh',overflowY:'auto',display:'flex',flexDirection:'column',gap:6}}>{classmates.map(c=><button className="paper-button" key={c.studentId} onClick={()=>handlePairByClassmate(c.studentId)} style={{justifyContent:'space-between',textAlign:'left'}}><span>{c.name}</span><span style={{fontSize:12,color:'#606b5a'}}>{c.studentNo}</span></button>)}</div>}</Modal>;
};
export default DeskMatePairingModal;
