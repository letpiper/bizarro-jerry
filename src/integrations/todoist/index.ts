import { BaseIntegration } from '../base';
import type { APIRequest, APIResponse } from '../../core/types';

export interface TodoistTask {
  id: string;
  content: string;
  description?: string;
  projectId: string;
  priority: number;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  labels?: string[];
  assignee?: string;
}

export interface TodoistProject {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

export class TodoistIntegration extends BaseIntegration {
  private tasks: Map<string, TodoistTask> = new Map();
  private projects: Map<string, TodoistProject> = new Map();
  private taskId = 0;
  private projectId = 0;

  constructor(world: any) {
    super('api.todoist.com', world);
    this.createDefaultProject();
  }

  private createDefaultProject(): void {
    const projId = `proj_${++this.projectId}`;
    this.projects.set(projId, {
      id: projId,
      name: 'Inbox',
      createdAt: new Date().toISOString(),
    });
  }

  snapshot(): unknown {
    return {
      taskCount: this.tasks.size,
      projectCount: this.projects.size,
      completedTasks: Array.from(this.tasks.values()).filter((t) => t.completed).length,
    };
  }

  async handle(request: APIRequest): Promise<APIResponse> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    if (path.includes('/rest/v2/tasks') && method === 'GET' && !path.includes('/tasks/')) {
      return this.handleListTasks(request);
    } else if (path.includes('/rest/v2/tasks') && method === 'POST') {
      return this.handleCreateTask(request);
    } else if (path.includes('/rest/v2/tasks/') && method === 'GET') {
      return this.handleGetTask(request);
    } else if (path.includes('/rest/v2/tasks/') && method === 'POST') {
      return this.handleUpdateTask(request);
    } else if (path.includes('/rest/v2/projects') && method === 'GET' && !path.includes('/projects/')) {
      return this.handleListProjects(request);
    } else if (path.includes('/rest/v2/projects') && method === 'POST') {
      return this.handleCreateProject(request);
    }

    return {
      status: 404,
      headers: { 'content-type': 'application/json' },
      body: { error: 'Not Found' },
      timestamp: new Date(),
    };
  }

  private handleListTasks(request: APIRequest): APIResponse {
    const url = new URL(request.url);
    const projectId = url.searchParams.get('project_id');

    let tasks = Array.from(this.tasks.values());
    if (projectId) {
      tasks = tasks.filter((t) => t.projectId === projectId);
    }

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: tasks,
      timestamp: new Date(),
    };
  }

  private handleCreateTask(request: APIRequest): APIResponse {
    const body = request.body as Record<string, any>;
    const taskId = `task_${++this.taskId}`;
    const defaultProject = Array.from(this.projects.keys())[0];

    const task: TodoistTask = {
      id: taskId,
      content: body.content || '',
      description: body.description,
      projectId: body.project_id || defaultProject,
      priority: body.priority || 1,
      dueDate: body.due?.date,
      completed: false,
      createdAt: new Date().toISOString(),
      labels: body.labels,
      assignee: body.assignee,
    };

    this.tasks.set(taskId, task);

    this.recordMutation('task_created', {
      taskId,
      content: task.content,
    });

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: task,
      timestamp: new Date(),
    };
  }

  private handleGetTask(request: APIRequest): APIResponse {
    const taskId = request.url.split('/tasks/')[1]?.split('?')[0];

    if (!taskId || !this.tasks.has(taskId)) {
      return {
        status: 404,
        headers: { 'content-type': 'application/json' },
        body: { error: 'Not Found' },
        timestamp: new Date(),
      };
    }

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: this.tasks.get(taskId),
      timestamp: new Date(),
    };
  }

  private handleUpdateTask(request: APIRequest): APIResponse {
    const taskId = request.url.split('/tasks/')[1]?.split('?')[0];
    const body = request.body as Record<string, any>;

    const task = this.tasks.get(taskId!);
    if (!task) {
      return {
        status: 404,
        headers: { 'content-type': 'application/json' },
        body: { error: 'Not Found' },
        timestamp: new Date(),
      };
    }

    if (body.content) task.content = body.content;
    if (body.priority !== undefined) task.priority = body.priority;
    if (body.due) task.dueDate = body.due.date;
    if (body.is_completed !== undefined) task.completed = body.is_completed;
    if (body.labels) task.labels = body.labels;

    this.recordMutation('task_updated', { taskId, completed: task.completed });

    return {
      status: 204,
      headers: { 'content-type': 'application/json' },
      body: {},
      timestamp: new Date(),
    };
  }

  private handleListProjects(request: APIRequest): APIResponse {
    const projects = Array.from(this.projects.values());

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: projects,
      timestamp: new Date(),
    };
  }

  private handleCreateProject(request: APIRequest): APIResponse {
    const body = request.body as Record<string, any>;
    const projId = `proj_${++this.projectId}`;

    const project: TodoistProject = {
      id: projId,
      name: body.name || 'New Project',
      color: body.color,
      createdAt: new Date().toISOString(),
    };

    this.projects.set(projId, project);

    this.recordMutation('project_created', {
      projectId: projId,
      name: project.name,
    });

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: project,
      timestamp: new Date(),
    };
  }

  // Test helpers
  createTask(content: string, projectId?: string): string {
    const taskId = `task_${++this.taskId}`;
    const defaultProject = Array.from(this.projects.keys())[0];

    const task: TodoistTask = {
      id: taskId,
      content,
      projectId: projectId || defaultProject,
      priority: 1,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.tasks.set(taskId, task);
    return taskId;
  }

  completeTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.completed = true;
    }
  }

  getTasks(projectId?: string): TodoistTask[] {
    let tasks = Array.from(this.tasks.values());
    if (projectId) {
      tasks = tasks.filter((t) => t.projectId === projectId);
    }
    return tasks;
  }
}
