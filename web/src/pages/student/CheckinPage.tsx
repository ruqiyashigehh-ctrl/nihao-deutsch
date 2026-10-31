import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/PageContainer';
import { Loading } from '../../components/Loading';
import { apiGet, apiPost } from '../../api/client';
import { useAdapter } from '../../app/adapterProvider';
import { t, type CheckpointItem, type CheckinResponse } from '@nihao-deutsch/shared';

export const CheckinPage: React.FC = () => {
  const [checkpoints, setCheckpoints] = useState<CheckpointItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { geo } = useAdapter();

  useEffect(() => {
    apiGet<CheckpointItem[]>('/checkin/checkpoints').then((data) => { setCheckpoints(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCheckin = async (cp: CheckpointItem) => {
    setError(null); setResult(null);
    try {
      const location = await geo.getLocation();
      const res = await apiPost<CheckinResponse>('/checkin', {
        checkpointId: cp.checkpointId, windowId: cp.checkpointId, latitude: location.latitude, longitude: location.longitude, accuracy: location.accuracy,
      });
      setResult(res.message);
    } catch (err: any) {
      const code = err?.response?.data?.error;
      if (code === 'OUT_OF_RANGE') setError(t('checkin.outOfRange'));
      else if (code === 'OUT_OF_WINDOW') setError(t('checkin.outOfWindow'));
      else if (code === 'ALREADY_CHECKED') setError(t('checkin.alreadyChecked'));
      else setError(t('checkin.locationFailed'));
    }
  };

  return (
    <PageContainer title="打卡签到">
      {loading ? <Loading /> :
        checkpoints.map((cp) => (
          <div className="paper-panel" key={cp.checkpointId} style={{ padding: 16, background: '#faf7ef', borderRadius: 8, marginBottom: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{cp.name}</div>
            <div style={{ fontSize: 12, color: '#707866', marginBottom: 8 }}>半径: {cp.radius}m {cp.requireScan ? '· 需扫码' : ''}</div>
            <button className="paper-native-button" onClick={() => handleCheckin(cp)} style={{ width: '100%', padding: 8, background: '#33583f', color: '#faf7ef', border: 'none', borderRadius: 6, cursor: 'pointer' }}>打卡</button>
          </div>
        ))
      }
      {result && <div style={{ padding: 12, background: '#e8eddf', borderRadius: 8, color: '#43654e', marginTop: 8 }}>{result}</div>}
      {error && <div style={{ padding: 12, background: '#f3e5dc', borderRadius: 8, color: '#a34334', marginTop: 8 }}>{error}</div>}
    </PageContainer>
  );
};
export default CheckinPage;