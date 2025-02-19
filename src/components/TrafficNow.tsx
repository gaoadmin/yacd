import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { State } from '$src/store/types';
import { ClashAPIConfig } from '$src/types';

import * as connAPI from '../api/connections';
import { fetchData } from '../api/traffic';
import prettyBytes from '../misc/pretty-bytes';
import { getClashAPIConfig } from '../store/app';
import { connect } from './StateProvider';
import s0 from './TrafficNow.module.scss';

const { useState, useEffect, useCallback } = React;

const mapState = (s: State) => ({
  apiConfig: getClashAPIConfig(s),
});
export default connect(mapState)(TrafficNow);

function TrafficNow({ apiConfig }) {
  const { t } = useTranslation();
  const { upStr, downStr, lost, data, bill } = useSpeed(apiConfig);
  const { upTotal, dlTotal, connNumber } = useConnection(apiConfig);
  return (
    <div className={s0.TrafficNow}>
      <div className={s0.sec}>
        <div>{t('Upload')}</div>
        <div>{upStr}</div>
      </div>
      <div className={s0.sec}>
        <div>{t('Download')}</div>
        <div>{downStr}</div>
      </div>
      <div className={s0.sec}>
        <div>{t('Upload Total')}</div>
        <div>{upTotal}</div>
      </div>
      <div className={s0.sec}>
        <div>{t('Download Total')}</div>
        <div>{dlTotal}</div>
      </div>
      <div className={s0.sec}>
        <div>{t('Active Connections')}</div>
        <div>{connNumber}</div>
      </div>
      <div className={s0.sec}>
        <div>{t('Lost Traffic')}</div>
        <div>{lost}</div>
      </div>
      <div className={s0.sec}>
        <div>{t('Data Left General/Special')}</div>
        <div>{data}</div>
      </div>
      <div className={s0.sec}>
        <div>{t('Phone Bill')}</div>
        <div>{bill}</div>
      </div>
    </div>
  );
}

function useSpeed(apiConfig: ClashAPIConfig) {
  const [speed, setSpeed] = useState({ upStr: '0 B/s', downStr: '0 B/s', lost: '0 B', data: '0 B/0 B', bill: '0'});
  useEffect(() => {
    return fetchData(apiConfig).subscribe((o) =>
      setSpeed({
        upStr: prettyBytes(o.up) + '/s',
        downStr: prettyBytes(o.down) + '/s',
        lost: prettyBytes(o.lost),
		Data: prettyBytes(o.general) + '/' + prettyBytes(o.special),
		Bill: o.over,
      })
    );
  }, [apiConfig]);
  return speed;
}

function useConnection(apiConfig: ClashAPIConfig) {
  const [state, setState] = useState({
    upTotal: '0 B',
    dlTotal: '0 B',
    connNumber: 0,
  });
  const read = useCallback(
    ({ downloadTotal, uploadTotal, connections}) => {
      setState({
        upTotal: prettyBytes(uploadTotal),
        dlTotal: prettyBytes(downloadTotal),
        connNumber: connections.length,
      });
    },
    [setState]
  );
  useEffect(() => {
    return connAPI.fetchData(apiConfig, read);
  }, [apiConfig, read]);
  return state;
}

