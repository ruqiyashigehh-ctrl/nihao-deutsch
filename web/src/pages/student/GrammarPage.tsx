import React,{useState,useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {RightOutlined} from '@ant-design/icons';
import {PageContainer} from '../../components/PageContainer';
import {EmptyState} from '../../components/EmptyState';
import {Loading} from '../../components/Loading';
import {apiGet} from '../../api/client';
import type {GrammarListItem} from '@nihao-deutsch/shared';
export const GrammarPage:React.FC=()=>{
 const [items,setItems]=useState<GrammarListItem[]>([]);const [loading,setLoading]=useState(true);const navigate=useNavigate();
 useEffect(()=>{apiGet<GrammarListItem[]>('/grammar').then(data=>{setItems(data);setLoading(false);}).catch(()=>setLoading(false));},[]);
 return <PageContainer title="语法学习">{loading?<Loading />:items.length===0?<EmptyState messageKey="grammar.listEmpty" />:<div className="paper-resource-list">{items.map(g=><button className="paper-resource-row" key={g.grammarId} onClick={()=>navigate(`/student/grammar/${g.grammarId}`)}><span><strong>{g.title}</strong><small>{g.difficulty}{g.exerciseAvailable?' · 配套练习':''}</small></span><RightOutlined aria-hidden="true" /></button>)}</div>}</PageContainer>;
};
export default GrammarPage;
