import styled from 'styled-components';

type fitElementType = {
  type: string;
  workout_type: string;
  period: number;
  category: string;
  weight: number;
  rep: number;
  set: number;
  time: number;
  date: string | null;
};

export interface IProps {
  key: number;
  workouts: fitElementType[];
}

const types = ['leg', 'back', 'chest', 'arm', 'deltoid', 'abs', 'etc'];

export const Hover = (props: IProps) => {
  const workouts_list = new Map<string, fitElementType[]>();
  if (typeof props.workouts !== 'undefined' && props.workouts?.length > 0) {
    props.workouts?.forEach((workout: fitElementType) => {
      if (workouts_list.get(workout['category']) !== undefined) {
        workouts_list.get(workout['category'])!.push(workout);
      } else {
        workouts_list.set(workout['category'], []);
        workouts_list.get(workout['category'])!.push(workout);
      }
    });
  }

  const workout_type_list = (category: string, key: number) => (
    <WorkoutSingle key={key}>
      <WorkoutColor className={category} />
      {workouts_list.get(category) !== undefined && workouts_list.get(category)!.length > 1
        ? workouts_list.get(category)![0]['workout_type'] + ` 외 ${workouts_list.get(category)!.length - 1}개`
        : workouts_list.get(category) !== undefined && workouts_list.get(category)!.length > 0
        ? workouts_list.get(category)![0]['workout_type']
        : ''}
    </WorkoutSingle>
  );
  return (
    <HoverWrapper>
      {typeof props.workouts !== 'undefined' && props.workouts?.length === 0 ? (
        <Content>기록된 운동이 없습니다!</Content>
      ) : (
        <WorkoutList key={0}>{types.map((type_single, index) => workout_type_list(type_single, index))}</WorkoutList>
      )}
      <br />
      <hr />
      <br />
      {props.workouts?.length} 종류
    </HoverWrapper>
  );
};

const HoverWrapper = styled.div`
  width: 100%;
  height: 100%;
  margin-top: 5px;
`;

const WorkoutList = styled.div`
  flex-direction: column;
`;

const Content = styled.div`
  height: 100px;
  width: 100px;
  align-items: center;
  justify-content: center;
`;

const WorkoutSingle = styled.div`
  display: flex;
  font-family: IBMPlexSansThaiLooped;
  flex-direction: row;
  margin: 4px;
  margin-left: 0px;
`;

const WorkoutColor = styled.div`
  width: 12px;
  height: 12px;
  margin-right: 6px;
  border-radius: 50%;
  background: #a2cff9;
  &&.leg {
    background: #a2cff9;
  }
  &&.back {
    background: #f4d284;
  }
  &&.chest {
    background: #f9b6a2;
  }
  &&.deltoid {
    background: #f9a2b6;
  }
  &&.abs {
    background: #9fd6cd;
  }
  &&.cardio {
    background: #d3b7d8;
  }
  &&.etc {
    background: #d3b7d8;
  }
  &&.arm {
    background: #a9f9a2;
  }
`;