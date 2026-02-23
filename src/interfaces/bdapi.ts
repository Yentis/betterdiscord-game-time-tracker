import { ReactElement } from 'react';
import { Setting } from './settings';
import { BoundBdApi } from 'betterdiscord';

export type ChangelogChanges = {
  title: string;
  type: 'fixed' | 'added' | 'progress' | 'changed';
  items: string[];
  blurb?: string;
};

type ChangelogOptions = {
  title: string;
  subtitle?: string;
  blurb?: string;
  banner?: string;
  video?: string;
  poster?: string;
  footer?: string | ReactElement | (string | ReactElement)[];
  changes?: ChangelogChanges[];
};

type SettingsPanelOptions = {
  settings: Setting[];
  onChange: (categoryId: string | null, settingId: string, settingValue: unknown) => void;
  onDrawerToggle?: (categoryId: string, state: boolean) => void;
  getDrawerState?: (categoryId: string, defaultState: boolean) => void;
};

type OptionType = {
  ATTACHMENT: number;
  BOOLEAN: number;
  CHANNEL: number;
  INTEGER: number;
  MENTIONABLE: number;
  NUMBER: number;
  ROLE: number;
  STRING: number;
  SUB_COMMAND: number;
  SUB_COMMAND_GROUP: number;
  USER: number;
};

type ExecuteOptions = [{ value?: string }];

export type Command = {
  id: string;
  name: string;
  description?: string;
  options?: {
    name: string;
    description?: string;
    required?: boolean;
    type: number;
    maxLength?: number;
    minLength?: number;
    maxValue?: number;
    minValue?: number;
    choices?: {
      name: string;
      value: string | number;
    }[];
  }[];
  execute: (options: ExecuteOptions) => void;
};

// TODO: remove custom TS type when BD types are updated
export type BoundBdApiExtended = BoundBdApi & {
  UI: {
    showChangelogModal: (options: ChangelogOptions) => string;
    buildSettingItem: (setting: Setting) => ReactElement;
    buildSettingsPanel: (options: SettingsPanelOptions) => ReactElement;
  };
  Components: {
    Group: string;
    TextInput: string;
    Button: string;
  };
  ReactDOM: {
    createRoot: (element: HTMLElement) => {
      render: (element: ReactElement) => void;
    };
  };
  Logger: {
    stacktrace: (message: string, error: Error) => void;
    error: (...message: unknown[]) => void;
    warn: (...message: unknown[]) => void;
    info: (...message: unknown[]) => void;
    debug: (...message: unknown[]) => void;
    log: (...message: unknown[]) => void;
  };
  Commands: {
    Types: {
      OptionTypes: OptionType;
    };
    register: (...commands: Command[]) => () => void;
    unregisterAll: () => void;
  };
};
