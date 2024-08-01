import { useState, useEffect, useMemo } from 'react'
import Button from '@/components/ui/Button'
import DataTable from '@/components/shared/DataTable'
import axios from 'axios'
import type { ColumnDef, OnSortParam } from '@/components/shared/DataTable'
import { Avatar, Card, Dialog, Tag } from '@/components/ui'
import { deleteTask, getTasks } from '@/services/tasks.service'
import {
    BsFilePdf,
    BsPencilSquare,
    BsPlusCircle,
    BsTrash,
} from 'react-icons/bs'
import { usePDF } from 'react-to-pdf'
import TaskForm from './TaskForm'
import { ConfirmDialog } from '@/components/shared'
import { getUsers } from '@/services/AuthService'

type Customer = {
    id: string
    name: string
    email: string
}

const Basic = () => {
    const { toPDF, targetRef } = usePDF({
        filename: `tasks-${new Date()}.pdf`,
        page: {
            format: 'letter',
            // default is 'portrait'
            orientation: 'landscape',
        },
    })
    const [data, setData] = useState([])

    const [userData, setUserData] = useState([])

    const [loading, setLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
    const [taskToDeleteId, setTaskToDeleteId] = useState('')
    const [taskToEdit, setTaskToEdit] = useState({})
    const [tableData, setTableData] = useState<{
        pageIndex: number
        pageSize: number
        sort: {
            order: '' | 'asc' | 'desc'
            key: string | number
        }
        query: string
        total: number
    }>({
        total: 0,
        pageIndex: 1,
        pageSize: 10,
        query: '',
        sort: {
            order: '',
            key: '',
        },
    })
    const statuses: Option[] = [
        { value: '6594497b0b9185ef9fbd53db', label: 'To Do' },
        { value: '659448dd0b9185ef9fbd53bc', label: 'Done' },
        { value: '6609a5da129073457892d79a', label: 'In Progress' },
        { value: '667155aca1adffb385b4be1c', label: 'Backlog' },
    ]

    const columns: ColumnDef<Customer>[] = useMemo(() => {
        return [
            {
                header: 'Title',
                accessorKey: 'title',
            },
            {
                header: 'Description',
                accessorKey: 'description',
            },
            {
                header: 'Assignees',
                id: 'assignees',
                cell: (props) => (
                    <Avatar.Group
                        chained
                        omittedAvatarTooltip
                        maxCount={4}
                        omittedAvatarProps={{ shape: 'circle' }}
                        onOmittedAvatarClick={() =>
                            console.log('Omitted Avatar Clicked')
                        }
                    >
                        {props.row.original?.assignees?.map((userId) => {
                            return (
                                <Avatar
                                    key={userId}
                                    shape="circle"
                                    src="/img/avatars/thumb-2.jpg"
                                />
                            )
                        })}
                    </Avatar.Group>
                ),
            },

            {
                header: 'priority',
                accessorKey: 'priority',
            },

            {
                header: 'Status',
                id: 'status',
                cell: (props) => (
                    <Tag>
                        {' '}
                        {
                            statuses?.find(
                                (option) =>
                                    option.value === props.row.original?.status,
                            )?.label
                        }
                    </Tag>
                ),
            },

            {
                header: 'createdAt',
                accessorKey: 'createdAt',
            },
            {
                header: '',
                id: 'action',
                cell: (props) => (
                    <div className="">
                        <Button
                            className="mr-2"
                            icon={<BsTrash color="red" />}
                            size="xs"
                            onClick={() => {
                                setTaskToDeleteId(props.row.original.id)
                                setIsConfirmDialogOpen(true)
                            }}
                        ></Button>
                        <Button
                            icon={<BsPencilSquare />}
                            size="xs"
                            onClick={() => {
                                setTaskToEdit(props.row.original)
                                setIsDialogOpen(true)
                            }}
                        ></Button>
                    </div>
                ),
            },
        ]
    }, [])

    const handlePaginationChange = (pageIndex: number) => {
        setTableData((prevData) => ({ ...prevData, ...{ pageIndex } }))
    }

    const handleSelectChange = (pageSize: number) => {
        setTableData((prevData) => ({ ...prevData, ...{ pageSize } }))
    }

    const handleSort = ({ order, key }: OnSortParam) => {
        setTableData((prevData) => ({
            ...prevData,
            sort: { order, key },
        }))
    }
    const fetchData = async () => {
        setLoading(true)
        const response = await getTasks({ page: tableData.pageIndex })
        if (response.data) {
            console.log(response.data)
            setData(response.data.results)
            setLoading(false)

            console.log()
            setTableData((prevData) => ({
                ...prevData,
                ...{ total: response.data.totalResults },
            }))
        }
    }

    const fetchUsers = async () => {
        const usersResponse = await getUsers()
        if (usersResponse.data) {
            setUserData(
                usersResponse.data.results?.map((user) => ({
                    value: user.id,
                    label: user.email,
                })),
            )
        }
    }
    useEffect(() => {
        fetchData()
    }, [tableData.pageIndex, tableData.sort, tableData.pageSize])

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleConfirmDialogClose = () => {
        setIsConfirmDialogOpen(false)
    }

    const handleDeleteTask = () => {
        deleteTask(taskToDeleteId)
            .then(() => {
                setIsConfirmDialogOpen(false)
                setTaskToDeleteId('')
                fetchData()
            })
            .catch(() => alert('error deleting'))
    }
    return (
        <Card>
            <ConfirmDialog
                isOpen={isConfirmDialogOpen}
                type={'warning'}
                title={'Delete Task'}
                // confirmButtonColor={dialogType[selected].confirmButtonColor}
                onClose={handleConfirmDialogClose}
                onRequestClose={handleConfirmDialogClose}
                onCancel={handleConfirmDialogClose}
                onConfirm={handleDeleteTask}
            >
                <p>Are you sure you want to delete this task?</p>
            </ConfirmDialog>
            <Dialog
                width={800}
                isOpen={isDialogOpen}
                onRequestClose={() => {
                    setIsDialogOpen(false)
                    setTaskToEdit({})
                }}
                onClose={() => {
                    setTaskToEdit({})
                    setIsDialogOpen(false)
                }}
            >
                <div>
                    <TaskForm
                        statuses={statuses}
                        defaultValues={taskToEdit}
                        userData={userData}
                        setIsDialogOpen={() => {
                            fetchData()
                            setIsDialogOpen(false)
                        }}
                    />
                </div>
            </Dialog>
            <Button
                className="mb-2 mr-2"
                size="sm"
                icon={<BsPlusCircle color="blue" />}
                onClick={() => {
                    setIsDialogOpen(true)
                }}
            >
                New Task
            </Button>
            <Button
                className="mb-2"
                size="sm"
                icon={<BsFilePdf color="red" />}
                onClick={() => toPDF()}
            >
                Download PDF
            </Button>
            <div ref={targetRef}>
                <DataTable<Customer>
                    key={userData}
                    columns={columns}
                    data={data}
                    loading={loading}
                    pagingData={{
                        total: tableData.total,
                        pageIndex: tableData.pageIndex,
                        pageSize: tableData.pageSize,
                    }}
                    onPaginationChange={handlePaginationChange}
                    onSelectChange={handleSelectChange}
                    onSort={handleSort}
                />
            </div>
        </Card>
    )
}

export default Basic
