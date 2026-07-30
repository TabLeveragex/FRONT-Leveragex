import React, { memo } from 'react';

const BTC_CHART_URL =
  'https://s.tradingview.com/widgetembed/?frameElementId=leveragex_btc_chart' +
  '&symbol=BINANCE%3ABTCUSDT' +
  '&interval=1' +
  '&hidesidetoolbar=0' +
  '&theme=dark' +
  '&style=1' +
  '&timezone=Etc%2FUTC' +
  '&withdateranges=1' +
  '&showpopupbutton=0' +
  '&studies=%5B%5D' +
  '&hide_top_toolbar=0' +
  '&hide_legend=0' +
  '&save_image=0' +
  '&locale=en' +
  '&enable_publishing=0' +
  '&allow_symbol_change=0';

function TradingView() {
  return (
    <iframe
      title="BTC/USDT TradingView Chart"
      className="tradingview-iframe"
      src={BTC_CHART_URL}
      frameBorder="0"
      scrolling="no"
      allowFullScreen
    />
  );
}

export default memo(TradingView);
