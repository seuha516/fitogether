import { render, screen } from '@testing-library/react';
import { MyMessage, OtherMessage, OtherGroupMessage } from './Message';

describe('Message', () => {
  test('MyMessage', () => {
    render(
      <MyMessage
        message={{
          author: null,
          content: 'content',
          created: '2022-01-06T00:00:00',
        }}
      />,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  test('OtherMessage 1', () => {
    render(
      <OtherMessage
        message={{
          author: null,
          content: 'content',
          created: '2022-01-06T00:00:00',
        }}
      />,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  test('OtherMessage 2', () => {
    render(
      <OtherMessage
        message={{
          author: {
            username: 'username',
            nickname: 'nickname',
            image: 'image.png',
          },
          content: 'content',
          created: '2022-01-06T00:00:00',
        }}
      />,
    );
    expect(screen.getByText('nickname')).toBeInTheDocument();
  });

  test('OtherGroupMessage 1', () => {
    render(
      <OtherGroupMessage
        message={{
          author: null,
          content: 'content',
          created: '2022-01-06T00:00:00',
        }}
      />,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  test('OtherGroupMessage 2', () => {
    render(
      <OtherGroupMessage
        message={{
          author: {
            username: 'username',
            nickname: 'nickname',
            image: 'image.png',
          },
          content: 'content',
          created: '2022-01-06T00:00:00',
        }}
      />,
    );
    expect(screen.getByText('nickname')).toBeInTheDocument();
  });
});
