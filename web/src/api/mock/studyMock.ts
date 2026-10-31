import type { StudyCardData } from '../../types/domain';

const MOCK_WORDS: StudyCardData[] = [
  { wordId: 'w01', word: 'der Apfel', phonetic: 'ˈapfl̩', pos: '名词', definition: '苹果', example: 'Ich esse einen Apfel.（我吃一个苹果。）' },
  { wordId: 'w02', word: 'die Schule', phonetic: 'ˈʃuːlə', pos: '名词', definition: '学校', example: 'Die Schule beginnt um acht.（学校八点开始。）' },
  { wordId: 'w03', word: 'lernen', phonetic: 'ˈlɛʁnən', pos: '动词', definition: '学习', example: 'Wir lernen Deutsch.（我们学习德语。）' },
  { wordId: 'w04', word: 'schön', phonetic: 'ʃøːn', pos: '形容词', definition: '美丽的', example: 'Das Wetter ist schön.（天气很好。）' },
  { wordId: 'w05', word: 'das Buch', phonetic: 'buːx', pos: '名词', definition: '书', example: 'Ich lese ein Buch.（我在读一本书。）' },
  { wordId: 'w06', word: 'gehen', phonetic: 'ˈɡeːən', pos: '动词', definition: '走，去', example: 'Wir gehen nach Hause.（我们回家。）' },
  { wordId: 'w07', word: 'groß', phonetic: 'ɡʁoːs', pos: '形容词', definition: '大的', example: 'Das Haus ist groß.（房子很大。）' },
  { wordId: 'w08', word: 'die Zeit', phonetic: 'tsaɪ̯t', pos: '名词', definition: '时间', example: 'Die Zeit vergeht schnell.（时间过得很快。）' },
  { wordId: 'w09', word: 'sprechen', phonetic: 'ˈʃpʁɛçən', pos: '动词', definition: '说话', example: 'Kannst du Deutsch sprechen?（你会说德语吗？）' },
  { wordId: 'w10', word: 'gut', phonetic: 'ɡuːt', pos: '形容词', definition: '好的', example: 'Das ist sehr gut.（这很好。）' },
  { wordId: 'w11', word: 'der Mann', phonetic: 'man', pos: '名词', definition: '男人', example: 'Der Mann ist freundlich.（这个男人很友好。）' },
  { wordId: 'w12', word: 'kommen', phonetic: 'ˈkɔmən', pos: '动词', definition: '来', example: 'Woher kommst du?（你从哪里来？）' },
  { wordId: 'w13', word: 'neu', phonetic: 'nɔɪ̯', pos: '形容词', definition: '新的', example: 'Das Auto ist neu.（这辆车是新的。）' },
  { wordId: 'w14', word: 'die Stadt', phonetic: 'ʃtat', pos: '名词', definition: '城市', example: 'Berlin ist eine große Stadt.（柏林是一座大城市。）' },
  { wordId: 'w15', word: 'verstehen', phonetic: 'fɛɐ̯ˈʃteːən', pos: '动词', definition: '理解', example: 'Ich verstehe das nicht.（我不明白这个。）' },
];

export function getTodayWords(): StudyCardData[] {
  return MOCK_WORDS;
}