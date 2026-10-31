import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SearchOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { PageHeading } from '../../components/PageHeading';
import { EmptyState } from '../../components/EmptyState';
import { Loading } from '../../components/Loading';
import { VocabNotebookButton } from '../../components/VocabNotebookButton';
import { MasteryRingProgress } from '../../components/MasteryRingProgress';
import { apiGet } from '../../api/client';
import { useWordStore } from '../../store/wordStore';
import { type WordListItem, type Pagination } from '@nihao-deutsch/shared';
export const WordsPage: React.FC = () => {
  const navigate = useNavigate();
  const [items,setItems]=useState<WordListItem[]>([]);
  const [loading,setLoading]=useState(true);
  const [keyword,setKeyword]=useState('');
  const [page,setPage]=useState(1);
  const [hasMore,setHasMore]=useState(false);
  const { notebookIds,mastery,loadNotebookIds,toggleNotebook,loadMastery }=useWordStore();
  const fetchWords=useCallback(async(p:number,kw:string)=>{
    setLoading(true);
    try{const params=new URLSearchParams({page:String(p),pageSize:'50'});if(kw)params.set('keyword',kw);const data=await apiGet<Pagination<WordListItem>>(`/words?${params}`);if(p===1)setItems(data.items);else setItems(prev=>[...prev,...data.items]);setHasMore(data.hasMore);setPage(p);}catch{setItems([]);}finally{setLoading(false);}
  },[]);
  useEffect(()=>{fetchWords(1,'');loadNotebookIds();loadMastery(1);},[fetchWords,loadNotebookIds,loadMastery]);
  const handleToggleNotebook=async(wordId:string)=>{const result=await toggleNotebook(wordId);if(!result.success)alert(result.message);};
  return <section>
    <PageHeading title="单词学习" eyebrow="词汇收藏 / WORDS" description="从一个词开始，慢慢读懂更多。" />
    <div className="paper-card paper-word-hero">
      {mastery && <MasteryRingProgress mastery={mastery} />}
      {!mastery && <span className="paper-eyebrow">每日积累</span>}
      <div className="paper-word-hero__copy"><h2>{mastery?'Lektion '+mastery.lektion+' · 学习进度':'今天，也学一点德语'}</h2><p>{mastery?'已掌握 '+mastery.mastered+' / '+mastery.total+' 词':'词汇与复习，按自己的节奏来。'}</p><button className="paper-button paper-button--primary" onClick={()=>navigate('/student/words/study')}>开始背词<ArrowRightOutlined aria-hidden="true" /></button></div>
    </div>
    <form className="paper-search" onSubmit={e=>{e.preventDefault();fetchWords(1,keyword);}}><SearchOutlined aria-hidden="true" /><input className="paper-input" aria-label="搜索单词" placeholder="搜索德语单词或中文释义" value={keyword} onChange={e=>setKeyword(e.target.value)} /><button className="paper-native-button" type="submit">搜索</button></form>
    {loading&&page===1?<Loading />:items.length===0?<EmptyState messageKey="word.searchEmpty" />:<div className="paper-word-list">{items.map(w=><article key={w.wordId} className="paper-word-row"><div className="paper-word-row__top"><div><Link className="paper-word-link" to={'/student/words/'+w.wordId} lang="de">{w.lemma}</Link><div className="paper-word-row__meta"><span>{w.pos}</span><span>{w.difficulty}</span>{w.course&&<span>{w.course}</span>}</div></div><VocabNotebookButton wordId={w.wordId} added={notebookIds.includes(w.wordId)} onToggle={handleToggleNotebook} /></div><p>{w.meaning}</p></article>)}{hasMore&&!loading&&<button className="paper-button paper-button--wide" onClick={()=>fetchWords(page+1,keyword)}>加载更多词汇</button>}{loading&&page>1&&<Loading />}</div>}
  </section>;
};
export default WordsPage;
