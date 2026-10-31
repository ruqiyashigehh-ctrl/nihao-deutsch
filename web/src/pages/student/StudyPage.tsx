import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, CheckOutlined, ReadOutlined } from '@ant-design/icons';
import { useStudyStore } from '../../store/studyStore';
import { useTTS } from '../../hooks/useTTS';
import { StudyCard } from '../../components/StudyCard';
import { StudyProgress } from '../../components/StudyProgress';
import '../../styles/study-paper.css';

export const StudyPage: React.FC = () => {
  const navigate = useNavigate();
  const { supported: ttsSupported, speak } = useTTS();
  const {
    words, currentIndex, isFlipped, loading, results,
    loadTodayWords, flip, mark, isComplete,
  } = useStudyStore();

  useEffect(() => { loadTodayWords(); }, [loadTodayWords]);

  const complete = !loading && words.length > 0 && isComplete();
  const knownCount = Object.values(results).filter((status) => status === 'known').length;
  const unknownCount = Object.values(results).filter((status) => status === 'unknown').length;
  const currentWord = words[currentIndex];
  const returnToWords = () => navigate('/student/words');

  return (
    <section className="study-paper" aria-label="每日背词">
      <div className="study-paper__inner">
        <header className="study-paper__nav">
          <button className="study-paper__back" onClick={returnToWords} aria-label="返回词库"><ArrowLeftOutlined /></button>
          <span className="study-paper__brand" lang="de">Sprung.</span>
          <span className="study-paper__nav-label">每日学习</span>
        </header>
        <div className="study-paper__heading">
          <p className="study-paper__eyebrow">你好德语 <span aria-hidden="true">·</span> 今日词汇</p>
          <h1>{complete ? '这一轮，学完了。' : '一点进步，每天发生。'}</h1>
        </div>

        {loading ? (
          <div className="study-paper__state" role="status">
            <ReadOutlined className="study-paper__state-icon" />
            <h2>正在准备今日词汇</h2><p>稍等片刻，学习即将开始。</p>
          </div>
        ) : words.length === 0 ? (
          <div className="study-paper__state">
            <ReadOutlined className="study-paper__state-icon" />
            <h2>暂无背词任务</h2><p>回到词库，看看今天想学些什么。</p>
            <button className="study-paper__primary" onClick={returnToWords}>返回词库</button>
          </div>
        ) : complete ? (
          <div className="study-paper__state study-paper__complete" role="status">
            <span className="study-paper__completion-mark"><CheckOutlined /></span>
            <p className="study-paper__eyebrow">本轮学习完成</p>
            <h2>又认识了更多德语。</h2>
            <p>每次认真回想，都是一点积累。</p>
            <dl className="study-paper__summary">
              <div><dt>认识</dt><dd>{knownCount}<span> 个</span></dd></div>
              <div><dt>不认识</dt><dd>{unknownCount}<span> 个</span></dd></div>
            </dl>
            <button className="study-paper__primary" onClick={returnToWords}>完成，返回词库 <ArrowLeftOutlined aria-hidden="true" /></button>
          </div>
        ) : currentWord ? (
          <>
            <StudyProgress index={currentIndex + 1} total={words.length} />
            <StudyCard
              key={currentWord.wordId}
              word={currentWord.word} phonetic={currentWord.phonetic}
              pos={currentWord.pos} definition={currentWord.definition}
              example={currentWord.example} isFlipped={isFlipped}
              ttsSupported={ttsSupported} onFlip={flip}
              onSpeak={() => speak(currentWord.word)} onMark={mark}
            />
          </>
        ) : null}

        <footer className="study-paper__footer"><ReadOutlined aria-hidden="true" /><span>复习与新学，按计划慢慢来</span></footer>
      </div>
    </section>
  );
};

export default StudyPage;
