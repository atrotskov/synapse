import { InjectionToken } from '@angular/core';
import type { App } from 'obsidian';
import type { SynapseSettings } from './types';

export const OBSIDIAN_APP = new InjectionToken<App>('obsidian.app');
export const SYNAPSE_SETTINGS = new InjectionToken<SynapseSettings>('synapse.settings');
