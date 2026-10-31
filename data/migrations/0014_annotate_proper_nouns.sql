-- 0014_annotate_proper_nouns.sql: 为国家名/语言名补充语法性别标注
-- 说明：wordlist_v1.2 中此类专名本身不带冠词（德语语法正确：aus Deutschland / spreche Deutsch），
--       但学习者需要知道其阴阳中性，故在释义中补充标注，避免"看起来没标词性"的误解
-- 其余可数名词（381 个）在词表中已直接以 der/die/das + 单词 形式存储（如 der Apfel）

UPDATE words SET meaning = '阿尔及利亚（das，国家名不加冠词）' WHERE lemma = 'Algerien';
UPDATE words SET meaning = '巴西（das，国家名不加冠词）' WHERE lemma = 'Brasilien';
UPDATE words SET meaning = '德国（das，国家名不加冠词）' WHERE lemma = 'Deutschland';
UPDATE words SET meaning = '法国（das，国家名不加冠词）' WHERE lemma = 'Frankreich';
UPDATE words SET meaning = '希腊（das，国家名不加冠词）' WHERE lemma = 'Griechenland';
UPDATE words SET meaning = '意大利（das，国家名不加冠词）' WHERE lemma = 'Italien';
UPDATE words SET meaning = '日本（das，国家名不加冠词）' WHERE lemma = 'Japan';
UPDATE words SET meaning = '墨西哥（das，国家名不加冠词）' WHERE lemma = 'Mexiko';
UPDATE words SET meaning = '波兰（das，国家名不加冠词）' WHERE lemma = 'Polen';
UPDATE words SET meaning = '葡萄牙（das，国家名不加冠词）' WHERE lemma = 'Portugal';
UPDATE words SET meaning = '俄罗斯（das，国家名不加冠词）' WHERE lemma = 'Russland';
UPDATE words SET meaning = '西班牙（das，国家名不加冠词）' WHERE lemma = 'Spanien';
UPDATE words SET meaning = '泰国（das，国家名不加冠词）' WHERE lemma = 'Thailand';
UPDATE words SET meaning = '奥地利（das，国家名不加冠词）' WHERE lemma = 'Österreich';

UPDATE words SET meaning = '阿拉伯语（das，语言名不加冠词）' WHERE lemma = 'Arabisch';
UPDATE words SET meaning = '保加利亚语（das，语言名不加冠词）' WHERE lemma = 'Bulgarisch';
UPDATE words SET meaning = '德语（das，语言名不加冠词）' WHERE lemma = 'Deutsch';
UPDATE words SET meaning = '英语（das，语言名不加冠词）' WHERE lemma = 'Englisch';
UPDATE words SET meaning = '法语（das，语言名不加冠词）' WHERE lemma = 'Französisch';
UPDATE words SET meaning = '印尼语（das，语言名不加冠词）' WHERE lemma = 'Indonesisch';
UPDATE words SET meaning = '意大利语（das，语言名不加冠词）' WHERE lemma = 'Italienisch';
UPDATE words SET meaning = '日语（das，语言名不加冠词）' WHERE lemma = 'Japanisch';
UPDATE words SET meaning = '波兰语（das，语言名不加冠词）' WHERE lemma = 'Polnisch';
UPDATE words SET meaning = '葡萄牙语（das，语言名不加冠词）' WHERE lemma = 'Portugiesisch';
UPDATE words SET meaning = '莱托罗曼语（das，语言名不加冠词）' WHERE lemma = 'Rätoromanisch';
UPDATE words SET meaning = '俄语（das，语言名不加冠词）' WHERE lemma = 'Russisch';
UPDATE words SET meaning = '塞尔维亚语（das，语言名不加冠词）' WHERE lemma = 'Serbisch';
UPDATE words SET meaning = '西班牙语（das，语言名不加冠词）' WHERE lemma = 'Spanisch';
UPDATE words SET meaning = '土耳其语（das，语言名不加冠词）' WHERE lemma = 'Türkisch';
UPDATE words SET meaning = '匈牙利语（das，语言名不加冠词）' WHERE lemma = 'Ungarisch';