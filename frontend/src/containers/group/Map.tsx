import { useEffect } from 'react';
const { kakao } = window;

const Map = () => {
  useEffect(() => {
    const container = document.getElementById('myMap');
    if (container) {
      const options = {
        center: new kakao.maps.LatLng(33.450701, 126.570667),
        level: 3,
      };
      const map = new kakao.maps.Map(container, options);
    }
  }, []);

  return (
    <div
      id="myMap"
      style={{
        width: '500px',
        height: '500px',
      }}
    ></div>
  );
};

export default Map;
