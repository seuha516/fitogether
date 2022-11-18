export type userStateType = {
  username: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  gender: string;
  height: string;
  weight: string;
  age: string;

  usernameWarning: {
    content: string;
    color: string;
  };
  passwordWarning: {
    content: string;
    color: string;
  };
  passwordConfirmWarning: {
    content: string;
    color: string;
  };
  nicknameWarning: {
    content: string;
    color: string;
  };
  bodyWarning: {
    content: string;
    color: string;
  };
};
export const userInitialState: userStateType = {
  username: '',
  password: '',
  passwordConfirm: '',
  nickname: '',
  gender: '',
  height: '',
  weight: '',
  age: '',

  usernameWarning: {
    content: '* 8 ~ 16자 영문, 숫자',
    color: '#686868',
  },
  passwordWarning: {
    content: '* 8 ~ 16자 영문, 숫자, 기호',
    color: '#686868',
  },
  passwordConfirmWarning: {
    content: '',
    color: '#686868',
  },
  nicknameWarning: {
    content: '* 2자 이상 8자 이하',
    color: '#686868',
  },
  bodyWarning: {
    content: '',
    color: '#686868',
  },
};
export const userReducer = (state: userStateType, action: { name: string; value: string }) => {
  const actionName: string = action.name;
  let newValue: string = action.value;
  const newWarning = {
    content: '',
    color: '',
  };

  switch (actionName) {
    case 'username': {
      const regex = /[^a-zA-Z0-9]/g;
      if (regex.test(newValue)) {
        newWarning.content = '* 영어와 숫자만 입력할 수 있습니다.';
        newValue = newValue.replace(regex, '');
      } else {
        newWarning.content = '* 8 ~ 16자 영문, 숫자';
      }

      newValue = newValue.substring(0, 16);
      if (newValue.length >= 8 && newValue.length <= 16) {
        newWarning.color = '#009112';
      } else if (newValue.length === 0) {
        newWarning.color = '#686868';
      } else {
        newWarning.color = '#ff3939';
      }

      return {
        ...state,
        [actionName]: newValue,
        [actionName + 'Warning']: newWarning,
      };
    }
    case 'password': {
      const regex = /[ㄱ-ㅎㅏ-ㅣ가-힣]/g;
      if (regex.test(newValue)) {
        newWarning.content = '* 한글을 입력할 수 없습니다.';
        newValue = newValue.replace(regex, '');
      } else {
        newWarning.content = '* 8 ~ 16자 영문, 숫자, 기호';
      }

      newValue = newValue.substring(0, 16);
      if (newValue.length >= 8 && newValue.length <= 16) {
        newWarning.color = '#009112';
      } else if (newValue.length === 0) {
        newWarning.color = '#686868';
      } else {
        newWarning.color = '#ff3939';
      }

      if (newValue === state.passwordConfirm && state.passwordConfirm.length > 0) {
        return {
          ...state,
          [actionName]: newValue,
          [actionName + 'Warning']: newWarning,
          passwordConfirmWarning: {
            content: '* 비밀번호가 일치합니다.',
            color: '#009112',
          },
        };
      } else if (state.passwordConfirm.length > 0) {
        return {
          ...state,
          [actionName]: newValue,
          [actionName + 'Warning']: newWarning,
          passwordConfirmWarning: {
            content: '* 비밀번호가 일치하지 않습니다.',
            color: '#ff3939',
          },
        };
      } else {
        return {
          ...state,
          [actionName]: newValue,
          [actionName + 'Warning']: newWarning,
        };
      }
    }
    case 'passwordConfirm': {
      const passwordPattern = /[ㄱ-ㅎㅏ-ㅣ가-힣]/g;
      newValue = newValue.replace(passwordPattern, '');

      newValue = newValue.substring(0, 16);
      if (newValue.length === 0) {
        newWarning.content = '';
        newWarning.color = '#686868';
      } else if (newValue === state.password) {
        newWarning.content = '* 비밀번호가 일치합니다.';
        newWarning.color = '#009112';
      } else {
        newWarning.content = '* 비밀번호가 일치하지 않습니다.';
        newWarning.color = '#ff3939';
      }

      return {
        ...state,
        [actionName]: newValue,
        [actionName + 'Warning']: newWarning,
      };
    }
    case 'nickname': {
      newWarning.content = '* 2자 이상 8자 이하';

      newValue = newValue.substring(0, 8);
      if (newValue.length >= 2 && newValue.length <= 8) {
        newWarning.color = '#009112';
      } else if (newValue.length === 0) {
        newWarning.color = '#686868';
      } else {
        newWarning.color = '#ff3939';
      }

      return {
        ...state,
        [actionName]: newValue,
        [actionName + 'Warning']: newWarning,
      };
    }
    case 'gender': {
      return {
        ...state,
        [actionName]: newValue,
      };
    }
    case 'height': {
      newValue = newValue.substring(0, 5);

      const exceptNum = /[^\d.]/g;
      newValue = newValue.replace(exceptNum, '');

      const regex = /^(\d{1,3})([.]\d)?$/;
      if (!regex.test(newValue)) {
        newWarning.content = '* 키는 정수 또는 소수점 첫째 자리까지여야 합니다.';
        newWarning.color = '#ff3939';
      } else {
        newWarning.content = '';
        newWarning.color = '#009112';
      }

      return {
        ...state,
        [actionName]: newValue,
        bodyWarning: newWarning,
      };
    }
    case 'weight': {
      newValue = newValue.substring(0, 5);

      const exceptNum = /[^\d.]/g;
      newValue = newValue.replace(exceptNum, '');

      const regex = /^(\d{1,3})([.]\d)?$/;
      if (!regex.test(newValue)) {
        newWarning.content = '* 몸무게는 정수 또는 소수점 첫째 자리까지여야 합니다.';
        newWarning.color = '#ff3939';
      } else {
        newWarning.content = '';
        newWarning.color = '#009112';
      }

      return {
        ...state,
        [actionName]: newValue,
        bodyWarning: newWarning,
      };
    }
    case 'age': {
      newValue = newValue.substring(0, 2);

      const exceptNum = /[^\d]/g;
      newValue = newValue.replace(exceptNum, '');

      return {
        ...state,
        [actionName]: newValue,
      };
    }
    default:
      return state;
  }
};

export const checkBody = (h: string, w: string, a: string) => {
  const regex1 = /^(\d{1,3})([.]\d)?$/;
  const regex2 = /^\d{1,3}$/;

  const height = parseFloat(h);
  const weight = parseFloat(w);
  const age = parseFloat(a);

  if (!height || height < 80.0 || height > 300.0 || !regex1.test(h)) {
    alert('올바른 키를 입력해 주세요.');
    return false;
  } else if (!weight || weight < 20.0 || weight > 300.0 || !regex1.test(w)) {
    alert('올바른 몸무게를 입력해 주세요.');
    return false;
  } else if (!age || age < 3 || !regex2.test(a)) {
    alert('올바른 나이를 입력해 주세요.');
    return false;
  }

  return true;
};

// Social Login
export type socialUserStateType = {
  username: string;
  nickname: string;
  gender: string;
  height: string;
  weight: string;
  age: string;

  nicknameWarning: {
    content: string;
    color: string;
  };
  bodyWarning: {
    content: string;
    color: string;
  };
};
export const socialUserInitialState: socialUserStateType = {
  username: '',
  nickname: '',
  gender: '',
  height: '',
  weight: '',
  age: '',

  nicknameWarning: {
    content: '* 2자 이상 8자 이하',
    color: '#686868',
  },
  bodyWarning: {
    content: '',
    color: '#686868',
  },
};
export const socialUserReducer = (state: socialUserStateType, action: { name: string; value: string }) => {
  const actionName: string = action.name;
  let newValue: string = action.value;
  const newWarning = {
    content: '',
    color: '',
  };

  switch (actionName) {
    case 'username':
    case 'gender': {
      return {
        ...state,
        [actionName]: newValue,
      };
    }
    case 'nickname': {
      newWarning.content = '* 2자 이상 8자 이하';

      newValue = newValue.substring(0, 8);
      if (newValue.length >= 2 && newValue.length <= 8) {
        newWarning.color = '#009112';
      } else if (newValue.length === 0) {
        newWarning.color = '#686868';
      } else {
        newWarning.color = '#ff3939';
      }

      return {
        ...state,
        [actionName]: newValue,
        [actionName + 'Warning']: newWarning,
      };
    }
    case 'height': {
      newValue = newValue.substring(0, 5);

      const exceptNum = /[^\d.]/g;
      newValue = newValue.replace(exceptNum, '');

      const regex = /^(\d{1,3})([.]\d)?$/;
      if (!regex.test(newValue)) {
        newWarning.content = '* 키는 정수 또는 소수점 첫째 자리까지여야 합니다.';
        newWarning.color = '#ff3939';
      } else {
        newWarning.content = '';
        newWarning.color = '#009112';
      }

      return {
        ...state,
        [actionName]: newValue,
        bodyWarning: newWarning,
      };
    }
    case 'weight': {
      newValue = newValue.substring(0, 5);

      const exceptNum = /[^\d.]/g;
      newValue = newValue.replace(exceptNum, '');

      const regex = /^(\d{1,3})([.]\d)?$/;
      if (!regex.test(newValue)) {
        newWarning.content = '* 몸무게는 정수 또는 소수점 첫째 자리까지여야 합니다.';
        newWarning.color = '#ff3939';
      } else {
        newWarning.content = '';
        newWarning.color = '#009112';
      }

      return {
        ...state,
        [actionName]: newValue,
        bodyWarning: newWarning,
      };
    }
    case 'age': {
      newValue = newValue.substring(0, 2);

      const exceptNum = /[^\d]/g;
      newValue = newValue.replace(exceptNum, '');

      return {
        ...state,
        [actionName]: newValue,
      };
    }
    default:
      return state;
  }
};
