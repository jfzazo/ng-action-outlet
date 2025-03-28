import {
  Component,
  Input,
  ViewChild,
  HostBinding,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Inject,
} from '@angular/core';
import { AnyAction, ActionGroup, ActionGroupComponentImpl, ActionAnchor } from 'ng-action-outlet/dist/core';
import { MatMenu } from '@angular/material/menu';

import { trackByAction, TrackByAction } from './common';
import { ACTION_ICON_TYPE_TOKEN, ICON_TYPE } from './action-icon-type-token';

@Component({
  selector: 'action-mat-menu',
  exportAs: 'actionMatMenu',
  template: `
    <mat-menu>
      <ng-template matMenuContent>
        <ng-container *ngTemplateOutlet="nestedMenu; context: { $implicit: _action }"></ng-container>

        <ng-template #nestedMenu let-action>
          <mat-divider *ngIf="_showDivider(action)"></mat-divider>
          <ng-container *ngFor="let child of action.children$ | async; trackBy: _trackByAction">
            <ng-container
              *ngTemplateOutlet="_isGroup(child) ? nestedGroup : actionOutlet; context: { $implicit: child }"
            ></ng-container>
          </ng-container>
        </ng-template>

        <ng-template #actionOutlet let-action>
          <ng-container *ngIf="action.visible$ | async" [ngSwitch]="_isAnchor(action)">
            <ng-container *ngSwitchCase="true">
              <a
                *ngIf="action.href$ | async; let href"
                mat-menu-item
                [actionMatButton]="action"
                [href]="href"
                [attr.target]="action.target$ | async"
              >
                <action-mat-content [action]="action"></action-mat-content>
              </a>
              <a
                *ngIf="action.routerLink$ | async; let routerLink"
                mat-menu-item
                [actionMatButton]="action"
                [routerLink]="routerLink"
                [target]="action.target$ | async"
              >
                <action-mat-content [action]="action"></action-mat-content>
              </a>
            </ng-container>

            <button *ngSwitchDefault mat-menu-item [actionMatButton]="action">
              <action-mat-content [action]="action"></action-mat-content>
            </button>
          </ng-container>
        </ng-template>

        <ng-template #nestedGroup let-action>
          <ng-container *ngIf="(action.children$ | async)?.length > 0">
            <ng-container
              *ngTemplateOutlet="_isDropdown(action) ? nestedDropdown : nestedMenu; context: { $implicit: action }"
            ></ng-container>
          </ng-container>
        </ng-template>

        <ng-template #nestedDropdown let-action>
          <action-mat-menu [action]="action" #nestedActionMenu="actionMatMenu"></action-mat-menu>

          <button
            *ngIf="(action.visible$ | async) && nestedActionMenu._menu; let menu"
            mat-menu-item
            [actionMatButton]="action"
            [matMenuTriggerFor]="menu"
          >
            <action-mat-content [action]="action"></action-mat-content>
          </button>
        </ng-template>
      </ng-template>
    </mat-menu>
  `,
  styles: [
    `
      .action-mat-menu {
        display: contents;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ActionMatMenuComponent implements ActionGroupComponentImpl {
  @ViewChild(MatMenu, { static: true })
  _menu?: MatMenu;

  @Input('action')
  _action?: ActionGroup | null;

  @HostBinding('class')
  readonly _classname = 'action-mat-menu';
  readonly _trackByAction: TrackByAction = trackByAction;

  constructor(
    @Inject(ACTION_ICON_TYPE_TOKEN)
    readonly _iconType: ICON_TYPE,
  ) {}

  _isGroup(action?: AnyAction): action is ActionGroup {
    return action instanceof ActionGroup;
  }

  _isDropdown(action?: AnyAction): action is ActionGroup {
    return action instanceof ActionGroup && action.isDropdown();
  }

  _isAnchor(action?: AnyAction): action is ActionAnchor {
    return action instanceof ActionAnchor;
  }

  _showDivider(action: ActionGroup) {
    const parent = action.getParent();
    return !action.isDropdown() && parent && parent.isDropdown() && parent.getChild(0) !== action;
  }
}
