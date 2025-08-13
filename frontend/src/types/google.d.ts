declare module 'qrcode';

declare namespace google.accounts.id {
  interface CredentialResponse {
    credential: string;
    select_by: string;
  }

  function initialize(options: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
  }): void;

  function renderButton(parent: HTMLElement, options: {
    theme: string;
    size: string;
  }): void;

  function prompt(): void;
}
