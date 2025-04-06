import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Result, Image, message, Spin } from 'antd';
import './Blessing.css';

const Blessing = () => {
  const { id } = useParams();
  const [blessing, setBlessing] = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const storedBlessings = localStorage.getItem('blessings');
    if (storedBlessings) {
      const blessings = JSON.parse(storedBlessings);
      const currentBlessing = blessings.find(b => b.id === Number(id));
      if (currentBlessing) {
        setBlessing(currentBlessing);
      }
    }
  }, [id]);

  if (!blessing) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您访问的祝福页面不存在"
      />
    );
  }

  const content = blessing.template.content.replace('{name}', blessing.name);

  return (
    <div className="blessing-container">
      <div className="blessing-card">
        <Card bordered={false}>
          <div className="blessing-content">
            {content.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
            
            {blessing.template.mediaType === 'image' && blessing.template.mediaUrl && (
              <div className="blessing-media">
                <Image 
                  src={blessing.template.mediaUrl} 
                  alt="祝福图片"
                  style={{ maxWidth: '100%', marginTop: '20px' }}
                />
              </div>
            )}
            
            {blessing.template.mediaType === 'video' && blessing.template.mediaUrl && (
              <div className="blessing-media">
                {videoLoading && <Spin tip="视频加载中..." />}
                {videoError ? (
                  <div style={{ textAlign: 'center', color: '#ff4d4f' }}>
                    <p>视频无法播放，请检查视频链接是否有效</p>
                    <p>视频URL: {blessing.template.mediaUrl}</p>
                  </div>
                ) : (
                  <video 
                    controls 
                    style={{ maxWidth: '100%', marginTop: '20px', display: videoLoading ? 'none' : 'block' }}
                    onError={(e) => {
                      console.error('视频加载失败:', e);
                      e.target.onerror = null;
                      setVideoError(true);
                      setVideoLoading(false);
                      message.error('视频无法播放，请检查视频链接是否有效');
                    }}
                    onLoadedData={() => {
                      setVideoLoading(false);
                      console.log('视频加载成功');
                    }}
                    preload="metadata"
                    playsInline
                  >
                    <source src={blessing.template.mediaUrl} type="video/mp4" />
                    <source src={blessing.template.mediaUrl} type="video/webm" />
                    <source src={blessing.template.mediaUrl} type="video/ogg" />
                    <p>您的浏览器不支持HTML5视频。请更换浏览器或检查视频链接。</p>
                  </video>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Blessing;