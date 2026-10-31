import React,{useState,useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {isAxiosError} from 'axios';
import {apiPost} from '../../api/client';
import {useAuthStore} from '../../store/authStore';
import {useClassStore} from '../../store/classStore';
export const BindPage:React.FC=()=>{
 const [name,setName]=useState('');const [classId,setClassId]=useState('');const [manualClassId,setManualClassId]=useState('');const [loading,setLoading]=useState(false);const [error,setError]=useState<string|null>(null);
 const navigate=useNavigate();const user=useAuthStore(s=>s);const setBound=useAuthStore(s=>s.setBound);const {classes,loaded,error:classError,loadClasses}=useClassStore();
 useEffect(()=>{if(user.name)setName(user.name);if(user.role==='student')loadClasses();},[user.name,user.role,loadClasses]);
 const showFallback=user.role==='student'&&loaded&&classes.length===0&&!!classError;const effectiveClassId=classId||(showFallback?manualClassId:'');
 const handleSubmit=async(e:React.FormEvent)=>{e.preventDefault();setError(null);if(user.role==='student'&&!effectiveClassId){setError('请选择班级');return;}setLoading(true);try{await apiPost('/auth/bind',{name,classId:effectiveClassId||null});setBound();navigate(user.role==='teacher'?'/teacher':user.role==='admin'?'/admin':'/student',{replace:true});}catch(err:unknown){setError(isAxiosError(err)&&err.response?.status===422?'班级不存在':'服务暂时不可用，请稍后重试');}finally{setLoading(false);}};
 return <main className="paper-auth"><div className="paper-auth__inner"><div className="paper-auth__brand"><span lang="de">Sprung.</span><small>你好德语</small></div><p className="paper-eyebrow">初次见面 / LET’S BEGIN</p><h1>找到你的学习班级。</h1><p className="paper-description">完善个人信息，开始和同学一起学习。</p><form className="paper-auth__card" onSubmit={handleSubmit}><label htmlFor="bind-name">姓名</label><input className="paper-input" id="bind-name" value={name} onChange={e=>setName(e.target.value)} required />{user.role==='student'&&<><label htmlFor="bind-class">班级</label>{showFallback?<><p className="paper-auth__error">班级列表加载失败，可手动输入班级编号。</p><input className="paper-input" id="bind-class" value={manualClassId} onChange={e=>setManualClassId(e.target.value)} placeholder="请输入班级编号" /></>:<select className="paper-input" id="bind-class" value={classId} onChange={e=>setClassId(e.target.value)}><option value="">请选择班级</option>{classes.map(c=><option key={c.classId} value={c.classId}>{c.className}</option>)}</select>}</>}{error&&<p className="paper-auth__error" role="alert">{error}</p>}<button className="paper-button paper-button--primary paper-button--wide" type="submit" disabled={loading}>{loading?'保存中…':'确认，开始学习'}</button></form></div></main>;
};
export default BindPage;
