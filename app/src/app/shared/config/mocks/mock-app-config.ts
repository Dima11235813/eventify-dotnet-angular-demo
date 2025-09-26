import { AppConfig } from '../app-config.model';

export const mockAppConfig: AppConfig = {
  version: 'mock',
  api: {
    baseUrl: 'http://localhost:5146',
    endpoints: {
      events: '/events',
      eventById: '/events/{id}',
      register: '/events/{id}/register',
      unregister: '/events/{id}/register',
      me: '/users/me'
    }
  }
};


