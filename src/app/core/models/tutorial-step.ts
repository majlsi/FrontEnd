
import { BaseModel } from './baseModel';

export class TutorialStep extends BaseModel {
    tutorial_step_name_ar: string;
    tutorial_step_name_en: string;
    tutorial_step_tag: string;
    tutorial_start_route: string;
    tutorial_steps_list: Array<string>;
}