import React from 'react';
import { CheckOutlined, CloseOutlined, SoundOutlined, SwapOutlined } from '@ant-design/icons';

interface StudyCardProps {
  word: string;
  phonetic: string;
  pos: string;
  definition: string;
  example?: string;
  isFlipped: boolean;
  ttsSupported: boolean;
  onFlip: () => void;
  onSpeak: () => void;
  onMark: (status: 'known' | 'unknown') => void;
}

export const StudyCard: React.FC<StudyCardProps> = ({
  word, phonetic, pos, definition, example, isFlipped, ttsSupported, onFlip, onSpeak, onMark,
}) => {
  const articleMatch = word.match(/^(der|die|das)\s+(.+)$/i);
  const article = articleMatch?.[1];
  const displayWord = articleMatch?.[2] ?? word;

  return (
    <div className="study-paper__exercise">
      <article className="study-paper__card" aria-label={isFlipped ? '词汇释义' : '词汇卡片'}>
        <div className="study-paper__card-meta"><span>{pos || '词汇'}</span><span>今日词汇</span></div>
        {isFlipped ? (
          <div className="study-paper__meaning" key="meaning">
            <p className="study-paper__small-word" lang="de">{word}</p>
            <h2 className="study-paper__definition">{definition}</h2>
            {example && <div className="study-paper__example"><span className="study-paper__example-label">例句</span><p>{example}</p></div>}
          </div>
        ) : (
          <div className="study-paper__word-face" key="word">
            <button className="study-paper__word-button" onClick={onFlip} aria-label={'查看“' + word + '”的释义'}>
              {article && <span className="study-paper__article" lang="de">{article}</span>}
              <span className="study-paper__word" lang="de">{displayWord}</span>
              {phonetic && <span className="study-paper__phonetic">/{phonetic.replace(/^\/|\/$/g, '')}/</span>}
            </button>
            <button className="study-paper__sound" onClick={onSpeak} disabled={!ttsSupported}
              aria-label={'播放“' + word + '”的德语发音'} title={ttsSupported ? '播放德语发音' : '当前浏览器不支持发音'}>
              <SoundOutlined />
            </button>
            {!ttsSupported && <span className="study-paper__sound-note">当前浏览器暂不支持发音</span>}
          </div>
        )}
        <button className="study-paper__flip" onClick={onFlip} aria-label={isFlipped ? '返回词面' : '查看释义'}><SwapOutlined />{isFlipped ? '返回词面' : '想好了吗？点击查看释义'}</button>
      </article>
      <div className="study-paper__judgement">
        <p className="study-paper__hint">{isFlipped ? '凭第一印象，判断熟悉程度' : '先回想含义，再给自己一个判断'}</p>
        <div className="study-paper__actions">
          <button className="paper-native-button" onClick={() => onMark('unknown')} disabled={!isFlipped}><CloseOutlined aria-hidden="true" />不认识</button>
          <button className="study-paper__known" onClick={() => onMark('known')} disabled={!isFlipped}><CheckOutlined aria-hidden="true" />认识</button>
        </div>
      </div>
    </div>
  );
};

export default StudyCard;
