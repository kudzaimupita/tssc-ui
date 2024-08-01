import ApiService from './ApiService'

export async function getTasks(params: never) {
    return ApiService.fetchData({
        url: '/tasks',
        method: 'get',
        params,
    })
}

export async function createTask(task: never) {
    return ApiService.fetchData({
        url: '/tasks',
        method: 'post',
        data: task,
    })
}

export async function updateTask(task: never, taskId: never) {
    return ApiService.fetchData({
        url: `/tasks/${taskId}`,
        method: 'patch',
        data: task,
    })
}

export async function getTask(taskId: never) {
    return ApiService.fetchData({
        url: `/tasks/${taskId}`,
        method: 'get',
    })
}

export async function deleteTask(taskId: never) {
    return ApiService.fetchData({
        url: `/tasks/${taskId}`,
        method: 'delete',
    })
}
