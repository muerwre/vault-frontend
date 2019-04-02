import * as React from 'react';
const style = require('./style.scss');
const logo_sm = require('$sprites/logo_sm.svg');

export const Header = () => (
  <div className="default_container head_container">
    <div className={style.container}>
      <div className={style.logo}>
        VAULT
      </div>
      <div className={style.spacer} />
      <div className={style.plugs}>
        <div>depth</div>
        <div>boris</div>
        <div>flow</div>
      </div>
      <div className={style.user_button}>
        <div className={style.user_avatar} />
        gvorcek
      </div>
    </div>
  </div>
);
