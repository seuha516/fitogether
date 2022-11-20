import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { RootState } from 'index';
import { groupActions } from 'store/slices/group';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

import {
  geolocationResponseType,
  coordinateType,
  co2addResponseType,
  keywordSearchResultType,
} from 'assets/types/group';
import Button1 from 'components/common/buttons/Button1';
import Button4 from 'components/common/buttons/Button4';
import { Fitelement } from 'store/apis/group';
import { FitElement } from 'components/fitelement/FitElement';

const GroupCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(({ user }: RootState) => user.user);
  const groupCreateStatus = useSelector(({ group }: RootState) => group.groupCreate);

  const [group_name, setGroupName] = useState('');
  const [max_num, setMaxNum] = useState(true);
  const [group_num, setGroupNum] = useState(0);
  const [set_date, setSetDate] = useState(true);
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [free, setFree] = useState(true);
  // goal
  const [workout_type, setWorkoutType] = useState<string | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [rep, setRep] = useState<number | null>(null);
  const [set, setSet] = useState<number | null>(null);
  const [wtime, setWTime] = useState<number | null>(null);
  const [goal_list, setGoalList] = useState<Fitelement[]>([]);
  // place
  const [place, setPlace] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<geolocationResponseType>({
    center: {
      lat: 37.480966,
      lng: 126.952317,
    },
    errMsg: null,
    isLoading: true,
  });
  const [clickedPosition, setClickedPosition] = useState<coordinateType>({ lat: null, lng: null });
  const [clickedAddress, setClickedAddress] = useState('');
  const [searchResult, setSearchResult] = useState<keywordSearchResultType[]>([]);
  const [map, setMap] = useState<kakao.maps.Map>();
  const [keyword, setKeyword] = useState('');
  const [markerInfo, setMarkerInfo] = useState<string | null>(null);

  const displayCenterInfo = (result: co2addResponseType[], status: kakao.maps.services.Status) => {
    if (status === kakao.maps.services.Status.OK) {
      setClickedAddress(`${result[0].address.address_name} ${markerInfo || ''}`);
    }
  };

  const createGoal = () => {
    if (workout_type && weight && rep && set && wtime) {
      const goal: Fitelement = {
        type: 'goal',
        category: 'body',
        workout_type: workout_type,
        weight: weight,
        rep: rep,
        set: set,
        time: wtime,
      };
      setGoalList([...goal_list, goal]);
      setWorkoutType('');
      setWeight(null);
      setRep(null);
      setSet(null);
      setWTime(null);
    } else alert('목표를 모두 채워주세요');
  };

  const removeGoal = (id: number) => {
    const new_list = [...goal_list];
    new_list.splice(id, 1);
    setGoalList(new_list);
  };

  const example_fit = {
    type: 'goal',
    workout_type: 'TEST TEST',
    category: 'TEST TEST',
    weight: 20,
    rep: 20,
    set: 3,
    time: 2,
  };

  const saveOnClick = () => {
    if (!user) return;
    if (group_name === '') {
      alert('그룹명을 입력해 주세요.');
      return;
    } else if (max_num && group_num < 2) {
      alert('최대 인원은 2 이상이어야 합니다.');
      return;
    } else if (set_date && (start_date === '' || end_date === '')) {
      alert('기간을 설정해 주세요.');
      return;
    } else if (set_date && start_date > end_date) {
      alert('기간이 올바르지 않습니다.');
      return;
    } else if (description === '') {
      alert('그룹에 대한 설명을 작성해야 합니다.');
    } else if (goal_list.length === 0) {
      alert('목표는 하나 이상이어야 합니다.');
      return;
    }

    const param_num = max_num ? group_num : null;
    const param_start_date = set_date ? start_date : null;
    const param_end_date = set_date ? end_date : null;
    const param_lat = place ? clickedPosition.lat : null;
    const param_lng = place ? clickedPosition.lng : null;
    const param_address = place ? clickedAddress : null;

    dispatch(
      groupActions.createGroup({
        group_name: group_name,
        number: param_num,
        start_date: param_start_date,
        end_date: param_end_date,
        description: description,
        free: free,
        group_leader: user.username,
        lat: param_lat,
        lng: param_lng,
        address: param_address,
        goal: goal_list,
      }),
    );
  };

  useEffect(() => {
    return () => {
      dispatch(groupActions.stateRefresh());
    };
  }, []);
  useEffect(() => {
    if (groupCreateStatus.group_id) {
      navigate(`/group/detail/${groupCreateStatus.group_id}`);
    }
  }, [groupCreateStatus.group_id]);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setCurrentLocation(prev => ({
            ...prev,
            center: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            isLoading: false,
          }));
        },
        err => {
          setCurrentLocation(prev => ({
            ...prev,
            errMsg: err.message,
            isLoading: false,
          }));
        },
      );
    } else {
      setCurrentLocation(prev => ({
        ...prev,
        errMsg: 'geolocation을 사용할 수 없습니다.',
        isLoading: false,
      }));
    }
  }, []);
  useEffect(() => {
    if (clickedPosition.lng && clickedPosition.lat) {
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.coord2Address(clickedPosition.lng, clickedPosition.lat, displayCenterInfo);
    }
  }, [clickedPosition]);
  useEffect(() => {
    if (!map) return;
    if (keyword === '') {
      const bounds = new kakao.maps.LatLngBounds();
      bounds.extend(new kakao.maps.LatLng(currentLocation.center.lat, currentLocation.center.lng));
      map.setBounds(bounds);
    }
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data, status, _pagination) => {
      if (status === kakao.maps.services.Status.OK) {
        const bounds = new kakao.maps.LatLngBounds();
        const psResults = [];
        for (let i = 0; i < data.length; i++) {
          psResults.push({
            position: {
              lat: +data[i].y,
              lng: +data[i].x,
            },
            content: data[i].place_name,
          });
          bounds.extend(new kakao.maps.LatLng(+data[i].y, +data[i].x));
        }
        setSearchResult(psResults);
        map.setBounds(bounds);
      }
    });
  }, [map, keyword]);

  return (
    <Wrapper>
      <TitleWrapper>
        <Button4 content="Back" clicked={() => navigate(`/group`)} />
        <Title>그룹 생성</Title>
        <div style={{ width: '136px' }} />
      </TitleWrapper>

      <CreateWrapper>
        <CreateText style={{ marginTop: '10px' }}>그룹명</CreateText>
        <CreateInput
          type="text"
          value={group_name}
          onChange={e => setGroupName(e.target.value)}
          placeholder="그룹의 이름"
        />

        <CreateText>최대 인원</CreateText>
        <div style={{ display: 'flex' }}>
          <CreateSmallText>최대 인원 설정</CreateSmallText>
          <CreateCheck type="checkbox" checked={max_num} onChange={() => setMaxNum(!max_num)} />
          <CreateInput
            type="number"
            disabled={!max_num}
            value={group_num}
            max="100"
            onChange={e => setGroupNum(e.target.valueAsNumber)}
            style={{ width: '90px' }}
          />
        </div>

        <CreateText>기간</CreateText>
        <div style={{ display: 'flex' }}>
          <CreateSmallText>기간 설정</CreateSmallText>
          <CreateCheck type="checkbox" checked={set_date} onChange={() => setSetDate(!set_date)} />
          <DateWrapper>
            <input
              data-testid="start_date"
              type="date"
              className="input-date"
              disabled={!set_date}
              onChange={e => setStartDate(e.target.value)}
            />
            <input
              data-testid="end_date"
              type="date"
              className="input-date"
              disabled={!set_date}
              onChange={e => setEndDate(e.target.value)}
            />
          </DateWrapper>
        </div>

        <CreateText>목표</CreateText>
        <LogInputBody>
          <LogInputBodyInput>
            <WorkoutTypeInput type="text" value={workout_type || ''} onChange={e => setWorkoutType(e.target.value)} />
            <WorkoutTypeInput
              className="type2"
              type="number"
              min="0"
              value={weight || 0}
              onChange={e => setWeight(Number(e.target.value))}
            />
            <WorkoutTypeInput
              className="type2"
              type="number"
              min="0"
              value={rep || 0}
              onChange={e => setRep(Number(e.target.value))}
            />
            <WorkoutTypeInput
              className="type2"
              type="number"
              min="0"
              value={set || 0}
              onChange={e => setSet(Number(e.target.value))}
            />
            <WorkoutTypeInput
              className="type2"
              type="number"
              min="0"
              value={wtime || 0}
              onChange={e => setWTime(Number(e.target.value))}
            />
          </LogInputBodyInput>
          <LogInputBodyButton>
            <AnyButton className="type1" onClick={() => createGoal()}>
              추가
            </AnyButton>
          </LogInputBodyButton>
        </LogInputBody>
        {goal_list.map((go_obj, index) => (
          <div style={{ display: 'flex' }}>
            <FitElement
              key={index}
              id={index + 1}
              type={go_obj.type}
              workout_type={go_obj.workout_type}
              category={go_obj.category}
              weight={go_obj.weight}
              rep={go_obj.rep}
              set={go_obj.set}
              time={go_obj.time}
            />
            <Button1 content="취소" clicked={() => removeGoal(goal_list.indexOf(go_obj))} />
          </div>
        ))}
        <CreateText>그룹 설명</CreateText>
        <CreateTextArea
          rows={10}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="그룹의 설명"
        />

        <CreateText>그룹 공개 설정</CreateText>
        <CreateCheck type="checkbox" checked={free} onChange={() => setFree(!free)} />

        <CreateText>그룹 장소 설정</CreateText>
        <CreateCheck type="checkbox" checked={place} onChange={() => setPlace(!place)} />
        <CreateInput type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="장소 검색" />
        {clickedAddress && <div>{`그룹 장소로 ${clickedAddress} 로 합니다.`}</div>}
        <Map // 로드뷰를 표시할 Container
          center={{
            lat: currentLocation.center.lat || 37.480966,
            lng: currentLocation.center.lng || 126.952317,
          }}
          style={{
            width: '60%',
            height: '350px',
          }}
          level={3}
          onClick={(_t, mouseEvent) => {
            setClickedPosition({
              lat: mouseEvent.latLng.getLat(),
              lng: mouseEvent.latLng.getLng(),
            });
            setMarkerInfo(null);
          }}
          onCreate={setMap}
        >
          <MapMarker position={{ lat: currentLocation.center.lat, lng: currentLocation.center.lng }} />
          {clickedPosition.lat && clickedPosition.lng && (
            <MapMarker position={{ lat: clickedPosition.lat, lng: clickedPosition.lng }} />
          )}
          {searchResult.map(marker => (
            <MapMarker
              key={`marker-${marker.content}-${marker.position.lat},${marker.position.lng}`}
              position={marker.position}
              onClick={() => {
                setMarkerInfo(marker.content);
                setClickedPosition({ lat: marker.position.lat, lng: marker.position.lng });
              }}
            >
              {markerInfo === marker.content && <div style={{ color: '#000' }}>{marker.content}</div>}
            </MapMarker>
          ))}
        </Map>
        {currentLocation.isLoading && <div>{'현위치를 불러오는 중입니다.'}</div>}
        {currentLocation.errMsg && <div>{`${'현위치를 불러오지 못해 서울대입구역을 기본 위치로 합니다.'}`}</div>}
        {currentLocation.center.lat && <div>{`현위치를 성공적으로 불렀습니다.`}</div>}
      </CreateWrapper>

      <Button1 content="Create" clicked={saveOnClick} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  height: 100%;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px 50px 20px;
`;

const TitleWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin: 40px 0;
  padding: 0 20px;

  @media all and (max-width: 560px) {
    margin: 40px 0 20px 0;
  }
`;
const Title = styled.div`
  margin-top: 20px;
  font-size: 45px;
  font-family: NanumSquareR;

  @media all and (max-width: 560px) {
    display: none;
  }
`;

const CreateWrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height: 100%;
  background-color: #fafff5;
  border: 1px solid #e1e1e1;
  border-radius: 20px;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
`;
const CreateText = styled.div`
  font-size: 21px;
  font-weight: 600;
  font-family: NanumSquareR;
  margin-top: 40px;
  margin-bottom: 15px;
`;
const CreateInput = styled.input`
  width: 240px;
  height: 36px;
  font-size: 21px;
  font-family: NanumSquareR;
  text-align: center;
  background-color: transparent;
  border: none;
  border-bottom: 2px solid #929292;
  padding-bottom: 10px;
  margin: 15px 0;
`;
const CreateSmallText = styled.div`
  height: 66px;
  padding-top: 18px;
  font-size: 18px;
  font-family: NanumSquareR;
  margin-right: 10px;
`;
const CreateCheck = styled.input`
  width: 24px;
  height: 24px;
  margin: 15px 10px 15px 0;
`;
const DateWrapper = styled.div`
  height: 66px;
  gap: 4px;
  padding-top: 3px;
  display: flex;
  flex-direction: column;
  font-size: 18px;
  font-family: NanumSquareR;
`;
const CreateTextArea = styled.textarea`
  width: 100%;
  max-width: 600px;
  padding: 15px;
  font-size: 18px;
  font-family: NanumSquareR;
  border: 3px solid #c5e7cb;
  border-radius: 10px;
  background-color: #ffffff;
  resize: none;
`;

const LogInputBodyInput = styled.div`
  width: 100%;
  height: 80%;
  display: flex;
  min-height: 60px;
  font-weight: normal;
`;

const WorkoutTypeInput = styled.input`
  width: 40%;
  height: 100%;
  padding: 8px 20px;
  font-size: 14px;
  margin: 7px;

  &&.type1 {
    width: 10%;
  }
  &&.type2 {
    width: 20%;
  }
`;

const LogInputBodyButton = styled.div`
  width: 100%;
  height: 20%;
  min-height: 40px;
  display: flex;
  justify-content: end;
  font-weight: normal;
`;

const LogInputBody = styled.div`
  width: 100%;
  height: 10%;
  max-height: 90px;
  display: flex;
  flex-direction: column;
  font-weight: normal;
  border-bottom: 1px solid black;
`;

const AnyButton = styled.button`
  width: 180px;
  height: 30px;
  margin: 5px;
  background-color: #d7efe3;
  border: 0;
  border-radius: 8px;
  font-family: FugazOne;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s linear;
  &:hover {
    background-color: #3bb978;
  }

  &&.type1 {
    width: 120px;
    height: 20px;
  }
`;

export default GroupCreate;
