import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Clock,
  Crown,
  Flag,
  Home,
  MapPin,
  ScrollText,
  Sword,
  User,
  X,
  Menu,
} from 'lucide-react';

const MingDynastyEmperors = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['ancestors', 'emperors', 'southern-ming'];
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveSection(section);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 平滑滚动
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setIsMobileMenuOpen(false);
    }
  };

  // 追尊先祖数据
  const ancestorsData = [
    { id: 1, templeName: '明德祖', posthumousName: '玄皇帝', name: '朱百六', note: '明太祖追尊' },
    { id: 2, templeName: '明懿祖', posthumousName: '恒皇帝', name: '朱四九', note: '明太祖追尊' },
    { id: 3, templeName: '明熙祖', posthumousName: '裕皇帝', name: '朱初一', note: '明太祖追尊' },
    { id: 4, templeName: '明仁祖', posthumousName: '淳皇帝', name: '朱世珍', note: '明太祖之父，明太祖追尊' },
    { id: 5, templeName: '明兴宗', posthumousName: '孝康皇帝', name: '朱标', note: '明惠宗追尊，靖难之役后被明成祖废除，后明安宗追复' },
    { id: 6, templeName: '明睿宗', posthumousName: '文献皇帝', name: '朱祐杬', note: '明世宗追尊' },
  ];

  // 明朝皇帝数据
  const emperorsData = [
    {
      id: 1,
      name: '朱元璋',
      templeName: '太祖',
      fullTitle: '开天行道肇纪立极大圣至神仁文义武俊德成功高皇帝',
      birthDeath: '1328年 - 1398年',
      reign: '1368年 - 1398年',
      description: '出身贫寒，曾为地主放牛、做过和尚。元末加入郭子兴的红巾军，因战功被封吴王。1368年称帝，国号大明，定都南京。在位期间整肃吏治、严惩贪腐，加强皇权，设立锦衣卫，推行多项制度改革，如三司六部制、卫所制度等。同时兴"文字狱"，定八股取士。洪武三十一年在南京逝世，葬于南京钟山孝陵。',
      image: 'https://s.coze.cn/t/a3iEawKiZXs/'
    },
    {
      id: 2,
      name: '朱允炆',
      templeName: '惠宗',
      fullTitle: '嗣天章道诚懿渊功观文扬武克仁笃孝让皇帝（南明弘光帝追尊），恭闵惠皇帝（清乾隆帝追谥）',
      birthDeath: '1377年 - 1402年',
      reign: '1398年 - 1402年',
      description: '朱元璋之孙，懿文太子朱标次子。1398年即位，年号建文。即位后行宽政、精简机构、减轻赋税，推行井田制，还实行削藩政策，引发燕王朱棣的"靖难之役"。1402年朱棣攻入南京后，朱允炆下落不明。',
      image: 'https://s.coze.cn/t/-l7frATOlgo/'
    },
    {
      id: 3,
      name: '朱棣',
      templeName: '成祖',
      fullTitle: '启天弘道高明肇运圣武神功纯仁至孝文皇帝',
      birthDeath: '1360年 - 1424年',
      reign: '1402年 - 1424年',
      description: '朱元璋第四子，初封燕王，镇守北平。发动"靖难之役"夺取皇位，年号永乐。在位期间继续削藩，设置内阁和东厂，加强中央集权；迁都北京，营建北京城，重修万里长城；五次亲征蒙古，占领安南；派郑和下西洋，加强中外交流；组织编纂《永乐大典》。病逝于北征返程途中，葬于长陵。',
      image: 'https://s.coze.cn/t/a3iEawKiZXs/'
    },
    {
      id: 4,
      name: '朱高炽',
      templeName: '仁宗',
      fullTitle: '敬天体道纯诚至德弘文钦武章圣达孝昭皇帝',
      birthDeath: '1378年 - 1425年',
      reign: '1424年 - 1425年',
      description: '朱棣嫡长子，1424年继位，年号洪熙。他为政开明，废除苛政，发展生产，与民休息，提升内阁职权。在位仅一年便驾崩，葬于十三陵之献陵。其死因存在多种争议，如肥胖引发心脏病、服用丹药、纵欲等。',
      image: 'https://s.coze.cn/t/-l7frATOlgo/'
    },
    {
      id: 5,
      name: '朱瞻基',
      templeName: '宣宗',
      fullTitle: '宪天崇道英明神圣钦文昭武宽仁纯孝章皇帝',
      birthDeath: '1398年 - 1435年',
      reign: '1425年 - 1435年',
      description: '朱高炽长子，自号长春真人。1425年即位，年号宣德。他早年受祖父朱棣喜爱，在位时罢黜庸官，整顿吏治，任用"三杨"等名臣，改革科举取士法，经济繁荣，社会安定，与父亲统治时期并称"仁宣之治"。1435年病逝于乾清宫，葬于景陵。',
      image: 'https://s.coze.cn/t/a3iEawKiZXs/'
    },
    {
      id: 6,
      name: '朱祁镇',
      templeName: '英宗',
      fullTitle: '法天立道仁明诚敬昭文宪武至德广孝睿皇帝',
      birthDeath: '1427年 - 1464年',
      reign: '1435年 - 1449年；1457年 - 1464年',
      description: '朱瞻基长子，两次在位，年号分别为正统和天顺。首次即位年仅九岁，前期由太皇太后和三杨辅政，国力强盛，后宠信宦官导致专权。1449年亲征瓦剌，在土木堡被俘，其弟朱祁钰即位。1450年被释放回京，1457年复位。废除了殉葬制度。',
      image: 'https://s.coze.cn/t/-l7frATOlgo/'
    },
    {
      id: 7,
      name: '朱祁钰',
      templeName: '代宗',
      fullTitle: '符天建道恭仁康定隆文布武显德崇孝景皇帝',
      birthDeath: '1428年 - 1457年',
      reign: '1449年 - 1457年',
      description: '朱瞻基次子，朱祁镇之弟。在朱祁镇被俘后被拥立为帝，年号景泰。在位时国家政治稳定，经济逐渐恢复。1457年，朱祁镇发动夺门之变复位，朱祁钰不久后去世。他是明代迁都北京之后，唯一一位没有葬于明十三陵的皇帝。',
      image: 'https://s.coze.cn/t/a3iEawKiZXs/'
    },
    {
      id: 8,
      name: '朱见深',
      templeName: '宪宗',
      fullTitle: '继天凝道诚明仁敬崇文肃武宏德圣孝纯皇帝',
      birthDeath: '1447年 - 1487年',
      reign: '1464年 - 1487年',
      description: '朱祁镇长子，1464年即位，年号成化。他在位时政治相对稳定，但过于依赖宦官势力，后期出现一些问题。在位期间平反于谦的冤案，于东厂之外增设西厂。',
      image: 'https://s.coze.cn/t/-l7frATOlgo/'
    },
    {
      id: 9,
      name: '朱祐樘',
      templeName: '孝宗',
      fullTitle: '建天明道纯诚中正圣文神武至仁大德敬皇帝',
      birthDeath: '1470年 - 1505年',
      reign: '1487年 - 1505年',
      description: '朱见深第三子，年号弘治。他统治时期政治清明，经济繁荣，史称"弘治中兴"。他为人宽厚仁慈，且一生只娶一位皇后，颇为专情。',
      image: 'https://s.coze.cn/t/a3iEawKiZXs/'
    },
    {
      id: 10,
      name: '朱厚照',
      templeName: '武宗',
      fullTitle: '承天达道英肃睿哲昭德显功弘文思孝毅皇帝',
      birthDeath: '1491年 - 1521年',
      reign: '1505年 - 1521年',
      description: '朱祐樘长子，1505年即位，年号正德。他沉湎于享乐，常离开京城寻欢作乐，导致国家政治动荡不安，加速了明朝的衰败。在位期间领兵抵御蒙古侵扰，取得应州之战的胜利，是明朝最后一位御驾亲征的皇帝。',
      image: 'https://s.coze.cn/t/-l7frATOlgo/'
    },
    {
      id: 11,
      name: '朱厚熜',
      templeName: '世宗',
      fullTitle: '钦天履道英毅神圣宣文广武洪仁大孝肃皇帝',
      birthDeath: '1507年 - 1566年',
      reign: '1521年 - 1566年',
      description: '兴献王朱祐杬之子，通过"大礼议"事件巩固皇权。在位时间较长，年号嘉靖。他前期革新除弊，后期崇信道教，不理朝政，致使朝政受影响，但国家政治相对还算稳定。在位期间戚继光抗倭取得胜利。',
      image: 'https://s.coze.cn/t/a3iEawKiZXs/'
    },
    {
      id: 12,
      name: '朱载坖',
      templeName: '穆宗',
      fullTitle: '契天隆道渊懿宽仁显文光武纯德弘孝庄皇帝',
      birthDeath: '1537年 - 1572年',
      reign: '1566年 - 1572年',
      description: '朱厚熜第三子，1566年即位，年号隆庆。在位时政治较为稳定，经济逐渐恢复，还实行开关政策，实现了隆庆开关和俺答封贡两件大事，史称"隆庆新政"。',
      image: 'https://s.coze.cn/t/-l7frATOlgo/'
    },
    {
      id: 13,
      name: '朱翊钧',
      templeName: '神宗',
      fullTitle: '范天合道哲肃敦简光文章武安仁止孝显皇帝',
      birthDeath: '1563年 - 1620年',
      reign: '1572年 - 1620年',
      description: '朱载坖第三子，1572年即位，年号万历。在位48年，是明朝在位时间最长的皇帝。前期在张居正辅佐下，国家政治稳重，经济繁荣；后期逐渐不理朝政，使国家走向衰败。期间发生了东林党争、国本之争等重大事件，经朝鲜之役与萨尔浒之战后，国力由盛转衰。',
      image: 'https://s.coze.cn/t/a3iEawKiZXs/'
    },
    {
      id: 14,
      name: '朱常洛',
      templeName: '光宗',
      fullTitle: '崇天契道英睿恭纯宪文景武渊仁懿孝贞皇帝',
      birthDeath: '1582年 - 1620年',
      reign: '1620年（仅29天）',
      description: '朱翊钧长子，1620年即位，年号泰昌。在位仅一个月，因"红丸案"去世。在位期间废除矿监和税监，拔擢良臣。',
      image: 'https://s.coze.cn/t/-l7frATOlgo/'
    },
    {
      id: 15,
      name: '朱由校',
      templeName: '熹宗',
      fullTitle: '达天阐道敦孝笃友章文襄武靖穆庄勤悊皇帝',
      birthDeath: '1605年 - 1627年',
      reign: '1620年 - 1627年',
      description: '朱常洛长子，1620年即位，年号天启。他痴迷于木工，不理朝政，致使宦官魏忠贤专权，政治黑暗动荡。陕北饥民起义爆发，后金攻占沈阳，明朝濒临崩溃。',
      image: 'https://s.coze.cn/t/a3iEawKiZXs/'
    },
    {
      id: 16,
      name: '朱由检',
      templeName: '思宗',
      fullTitle: '绍天绎道刚明恪俭揆文奋武敦仁懋孝烈皇帝（南明弘光帝上谥号），守道敬俭宽文襄武体仁致孝庄烈愍皇帝（清朝上谥号）',
      birthDeath: '1610年 - 1644年',
      reign: '1627年 - 1644年',
      description: '朱常洛第五子，1627年即位，年号崇祯。他力图挽救明朝，铲除魏忠贤势力，但因明朝积重难返，内有农民起义，外有后金（清）威胁，1644年李自成攻破北京时，他自缢于煤山，明朝灭亡。',
      image: 'https://s.coze.cn/t/-l7frATOlgo/'
    }
  ];

  // 南明皇帝数据
  const southernMingData = [
    {
      id: 1,
      name: '朱由崧',
      templeName: '安宗',
      fullTitle: '处天承道诚敬英哲缵文备武宣仁度孝简皇帝',
      birthDeath: '1607年 - 1646年',
      reign: '1644年 - 1645年',
      description: '福王朱常洵之子，崇祯帝自缢后在南京被拥立为帝，年号弘光。在位期间沉湎酒色，政治腐败，不久被清军俘虏处死。',
      image: 'https://s.coze.cn/t/-l7frATOlgo/'
    },
    {
      id: 2,
      name: '朱聿键',
      templeName: '绍宗',
      fullTitle: '配天至道弘毅肃穆思文烈武敏仁广孝襄皇帝',
      birthDeath: '1602年 - 1646年',
      reign: '1645年 - 1646年',
      description: '唐王朱桱之孙，弘光帝被俘后在福州称帝，年号隆武。他有意恢复明朝，但受制于郑芝龙，后被清军俘虏，绝食而死。',
      image: 'https://s.coze.cn/t/a3iEawKiZXs/'
    },
    {
      id: 3,
      name: '朱聿鐭',
      templeName: '文宗',
      fullTitle: '贞天应道昭崇德毅宁文宏武达仁闵孝节皇帝',
      birthDeath: '1605年 - 1647年',
      reign: '1646年',
      description: '朱聿键之弟，隆武帝死后在广州称帝，年号绍武。在位仅40天，被清军击败后自杀。',
      image: 'https://s.coze.cn/t/-l7frATOlgo/'
    },
    {
      id: 4,
      name: '朱由榔',
      templeName: '昭宗',
      fullTitle: '应天推道敏毅恭俭经文纬武礼仁克孝匡皇帝',
      birthDeath: '1623年 - 1662年',
      reign: '1646年 - 1662年',
      description: '桂王朱常瀛之子，在肇庆称帝，年号永历。在位期间得到大西军余部支持，坚持抗清斗争，但最终失败，被吴三桂绞死。',
      image: 'https://s.coze.cn/t/a3iEawKiZXs/'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f5f2] text-gray-800 font-serif">
      {/* 标题区 */}
      <header className="h-20 bg-gradient-to-r from-[#ae2d2d] to-[#c74242] flex flex-col justify-center items-center text-white">
        <h1 className="text-3xl font-bold">明朝帝王谱系可视化研究</h1>
        <p className="text-[#f0d6a4]">1368-1644 | 十六帝 二百七十六年</p>
      </header>

      {/* 导航条 */}
      <nav className="sticky top-0 z-50 bg-[#ae2d2d] text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Crown className="h-6 w-6" />
            <h1 className="text-xl font-bold">明朝帝王研究</h1>
          </div>
          
          {/* 桌面导航 */}
          <div className="hidden md:flex space-x-6">
            {[
              { id: 'ancestors', label: '追尊先祖', icon: <User className="h-5 w-5" /> },
              { id: 'emperors', label: '明朝皇帝', icon: <Crown className="h-5 w-5" /> },
              { id: 'southern-ming', label: '南明皇帝', icon: <Flag className="h-5 w-5" /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  activeSection === item.id ? 'bg-[#c74242]' : 'hover:bg-[#d35a5a]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          
          {/* 移动端菜单按钮 */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-[#d35a5a] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* 移动端菜单 */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-[#c74242] overflow-hidden"
            >
              <div className="flex flex-col space-y-2 p-4">
                {[
                  { id: 'ancestors', label: '追尊先祖', icon: <User className="h-5 w-5" /> },
                  { id: 'emperors', label: '明朝皇帝', icon: <Crown className="h-5 w-5" /> },
                  { id: 'southern-ming', label: '南明皇帝', icon: <Flag className="h-5 w-5" /> },
                ].map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    whileHover={{ x: 5 }}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-md ${
                      activeSection === item.id ? 'bg-[#ae2d2d]' : 'hover:bg-[#d35a5a]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* 简介部分 */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-xl shadow-md p-6 md:p-8"
          >
            <h2 className="text-3xl font-bold mb-4 flex items-center">
              <BookOpen className="mr-3 text-[#ae2d2d]" />
              明朝帝王研究
            </h2>
            <p className="text-lg mb-6">
              明朝（1368年 - 1644年）是中国历史上最后一个由汉族建立的大一统中原王朝，共传十二世，历经十六帝，享国276年。
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-[#f0ece8] rounded-lg p-4 flex items-center"
              >
                <Crown className="h-8 w-8 text-[#ae2d2d] mr-3" />
                <div>
                  <div className="text-sm text-[#5e4c42]">皇帝数量</div>
                  <div className="text-2xl font-bold text-[#ae2d2d]">16位</div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-[#f0ece8] rounded-lg p-4 flex items-center"
              >
                <Clock className="h-8 w-8 text-[#ae2d2d] mr-3" />
                <div>
                  <div className="text-sm text-[#5e4c42]">享国时间</div>
                  <div className="text-2xl font-bold text-[#ae2d2d]">276年</div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-[#f0ece8] rounded-lg p-4 flex items-center"
              >
                <Calendar className="h-8 w-8 text-[#ae2d2d] mr-3" />
                <div>
                  <div className="text-sm text-[#5e4c42]">时间跨度</div>
                  <div className="text-2xl font-bold text-[#ae2d2d]">1368-1644</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* 追尊先祖部分 */}
        <section id="ancestors" className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-md p-6 md:p-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <User className="mr-3 text-[#ae2d2d]" />
              一、追尊先祖
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#d4b59e]">
                <thead className="bg-[#e8e0db]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5e4c42] uppercase tracking-wider">序号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5e4c42] uppercase tracking-wider">庙号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5e4c42] uppercase tracking-wider">谥号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5e4c42] uppercase tracking-wider">名讳</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5e4c42] uppercase tracking-wider">备注</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#d4b59e]">
                  {ancestorsData?.map((ancestor) => (
                    <tr key={ancestor?.id} className="hover:bg-[#fff5f2]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ancestor?.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ancestor?.templeName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ancestor?.posthumousName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ancestor?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{ancestor?.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </section>

        {/* 明朝皇帝部分 */}
        <section id="emperors" className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-md p-6 md:p-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Crown className="mr-3 text-[#ae2d2d]" />
              二、明朝皇帝（1368年 - 1644年）
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {emperorsData?.map((emperor, index) => (
                <motion.div
                  key={emperor?.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, boxShadow: '0 8px 24px rgba(174,45,45,0.1)' }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="flex h-60">
                    <div className="w-2/5">
                      <img 
                        src={emperor?.image} 
                        alt={`明朝皇帝${emperor?.name}肖像`}
                        className="w-full h-full object-cover"
                        width={512}
                        height={512}
                      />
                    </div>
                    <div className="w-3/5 p-4 flex flex-col">
                      <h3 className="text-lg font-bold mb-1">
                        {index + 1}. 明{emperor?.templeName}{emperor?.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">{emperor?.fullTitle}</p>
                      
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 text-[#ae2d2d] mr-1" />
                        <span className="text-sm">{emperor?.birthDeath}</span>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        <Clock className="h-4 w-4 text-[#ae2d2d] mr-1" />
                        <span className="text-sm">{emperor?.reign}</span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto text-sm text-gray-700">
                        {emperor?.description}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* 南明专区 */}
        <section id="southern-ming">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-[#f0ece8] rounded-xl shadow-md p-6 md:p-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="w-1 h-6 bg-[#ae2d2d] mr-3"></span>
              <Flag className="mr-3 text-[#ae2d2d]" />
              三、南明皇帝
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {southernMingData?.map((emperor, index) => (
                <motion.div
                  key={emperor?.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, boxShadow: '0 8px 24px rgba(174,45,45,0.1)' }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="flex h-48">
                    <div className="w-2/5">
                      <img 
                        src={emperor?.image} 
                        alt={`南明皇帝${emperor?.name}肖像`}
                        className="w-full h-full object-cover"
                        width={512}
                        height={512}
                      />
                    </div>
                    <div className="w-3/5 p-4 flex flex-col">
                      <h3 className="text-lg font-bold mb-1">
                        {index + 1}. 明{emperor?.templeName}{emperor?.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">{emperor?.fullTitle}</p>
                      
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 text-[#ae2d2d] mr-1" />
                        <span className="text-sm">{emperor?.birthDeath}</span>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        <Clock className="h-4 w-4 text-[#ae2d2d] mr-1" />
                        <span className="text-sm">{emperor?.reign}</span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto text-sm text-gray-700">
                        {emperor?.description}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-[#e8e0db] py-6 border-t border-[#d4b59e] mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-2">
            <a 
              href="https://space.coze.cn" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#ae2d2d] font-bold hover:text-[#c74242] hover:underline transition-colors"
            >
              created by coze space
            </a>
          </div>
          <div className="text-sm text-[#5e4c42]">
            页面内容均由 AI 生成，仅供参考
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MingDynastyEmperors;