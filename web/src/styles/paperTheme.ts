import type { ThemeConfig } from 'antd';

export const paperTheme: ThemeConfig = {
  token: {
    colorPrimary: '#33583f', colorSuccess: '#43654e', colorWarning: '#a3752d', colorError: '#a34334', colorInfo: '#43654e',
    colorText: '#263c32', colorTextSecondary: '#606b5a', colorTextTertiary: '#707866',
    colorBgLayout: '#eeeade', colorBgContainer: '#faf7ef', colorBgElevated: '#faf7ef',
    colorBorder: '#cbd1bd', colorBorderSecondary: '#e0e3d5', colorFillAlter: '#f0eee3',
    borderRadius: 6, controlHeight: 40, fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
    boxShadow: '0 8px 24px rgba(38,60,50,0.08)',
  },
  components: {
    Menu: { itemBg: 'transparent', subMenuItemBg: 'transparent', itemSelectedBg: '#e2e7d7', itemSelectedColor: '#33583f', itemHoverBg: '#ecefdf', itemBorderRadius: 6, itemHeight: 44 },
    Table: { headerBg: '#e9ecde', headerColor: '#33583f', rowHoverBg: '#f0f1e6', borderColor: '#e0e3d5', cellPaddingBlock: 14 },
    Card: { headerBg: 'transparent', headerFontSize: 16 },
    Tabs: { inkBarColor: '#33583f' },
    Modal: { contentBg: '#faf7ef', headerBg: '#faf7ef' },
    Layout: { bodyBg: '#eeeade', siderBg: '#f8f5eb', headerBg: '#faf7ef' },
  },
};
