import styled from 'styled-components';
import { getContrastYIQ } from 'utils/color';

interface IPropsReactiveInput {
  colorProp: string;
}

const ColorReactiveInput = styled.input<IPropsReactiveInput>`
  ${({ colorProp }) =>
    colorProp &&
    `
      background: ${colorProp};
      color: ${getContrastYIQ(colorProp)};
      ::placeholder {
        color: ${getContrastYIQ(colorProp)};
      }
    `}
`;

export default ColorReactiveInput;
