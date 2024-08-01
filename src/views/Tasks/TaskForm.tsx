import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import TimeInput from '@/components/ui/TimeInput'
import Checkbox from '@/components/ui/Checkbox'
import Radio from '@/components/ui/Radio'
import Switcher from '@/components/ui/Switcher'
import Segment from '@/components/ui/Segment'
import Upload from '@/components/ui/Upload'
import SegmentItemOption from '@/components/shared/SegmentItemOption'
import { HiCheckCircle } from 'react-icons/hi'
import { Field, Form, Formik } from 'formik'
import CreatableSelect from 'react-select/creatable'
import * as Yup from 'yup'
import type { FieldProps } from 'formik'
import { BsPlusCircle, BsSave } from 'react-icons/bs'
import { RichTextEditor } from '@/components/shared'
import { createTask, updateTask } from '@/services/tasks.service'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { Alert } from '@/components/ui'
import { getUsers } from '@/services/AuthService'
import { useEffect, useState } from 'react'

type Option = {
    value: string
    label: string
}

type FormModel = {
    title: string
}

const segmentSelections = [
    { value: 'low', desc: 'Not urgent' },
    { value: 'medium', desc: 'No so important task' },
    { value: 'high', desc: 'Very important task.' },
]

const TaskForm = ({
    setIsDialogOpen,
    userData,
    defaultValues = {},
    statuses,
}) => {
    const [message, setMessage] = useTimeOutMessage()

    return (
        <div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <>{message}</>
                </Alert>
            )}
            <Formik
                enableReinitialize
                initialValues={
                    {
                        ...defaultValues,
                        priority: [defaultValues?.priority],
                    } || {
                        title: '',
                        description: '',
                        subTasks: [],
                        dueDate: new Date(),
                        assignees: [],
                        attachments: [],
                        content: '',
                        priority: ['low'],
                        notifyAssigneesOnChange: false,
                        labels: [],
                        status: '',
                    }
                }
                // validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    setSubmitting(true)
                    console.log(values)
                    values.priority = values.priority[0]

                    if (defaultValues?.id) {
                        delete values.id
                        delete values.updatedAt
                        delete values.createdAt
                        delete values.updatedBy
                        delete values.createdBy
                        updateTask(values, defaultValues?.id)
                            .then(() => {
                                setIsDialogOpen(false)
                                setSubmitting(false)
                            })
                            .catch(async (err) => {
                                setSubmitting(false)
                                console.log(
                                    err.response.data.message
                                        .split(`, "`)
                                        .map((error) => setMessage(error)),
                                )
                            })
                    } else {
                        createTask(values)
                            .then(() => {
                                setIsDialogOpen(false)
                                setSubmitting(false)
                            })
                            .catch(async (err) => {
                                setSubmitting(false)
                                console.log(
                                    err.response.data.message
                                        .split(`, "`)
                                        .map((error) => setMessage(error)),
                                )
                            })
                    }
                }}
            >
                {({ values, touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <div className="h-[700px] overflow-auto">
                                <FormItem
                                    asterisk
                                    label="Title"
                                    invalid={errors.title && touched.title}
                                    errorMessage={errors.title}
                                >
                                    <Field
                                        type="text"
                                        name="title"
                                        placeholder="Title"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    asterisk
                                    label="Description"
                                    invalid={
                                        errors.description &&
                                        touched.description
                                    }
                                    errorMessage={errors.description}
                                >
                                    <Field
                                        type="text"
                                        name="description"
                                        placeholder="description"
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    asterisk
                                    label="Content"
                                    invalid={errors.content && touched.content}
                                    errorMessage={errors.content}
                                >
                                    <Field name="content">
                                        {({
                                            field,
                                            form,
                                        }: FieldProps<FormModel>) => (
                                            <RichTextEditor
                                                value={values?.content}
                                                onChange={(data) =>
                                                    form.setFieldValue(
                                                        field.name,
                                                        data,
                                                    )
                                                }
                                            />
                                        )}
                                    </Field>
                                </FormItem>

                                <FormItem
                                    asterisk
                                    label="Status"
                                    invalid={errors.status && touched.status}
                                    errorMessage={errors.status}
                                >
                                    <Field name="status">
                                        {({
                                            field,
                                            form,
                                        }: FieldProps<FormModel>) => (
                                            <Select
                                                field={field}
                                                form={form}
                                                options={statuses}
                                                value={statuses.filter(
                                                    (option) =>
                                                        option.value ===
                                                        values.status,
                                                )}
                                                onChange={(option) =>
                                                    form.setFieldValue(
                                                        field.name,
                                                        option?.value,
                                                    )
                                                }
                                            />
                                        )}
                                    </Field>
                                </FormItem>

                                <FormItem
                                    asterisk
                                    label="Due Date"
                                    invalid={errors.dueDate && touched.dueDate}
                                    errorMessage={errors.dueDate}
                                >
                                    <Field
                                        name="dueDate"
                                        placeholder="Due Date"
                                    >
                                        {({
                                            field,
                                            form,
                                        }: FieldProps<FormModel>) => (
                                            <DatePicker
                                                field={field}
                                                form={form}
                                                value={values.dueDate}
                                                onChange={(date) => {
                                                    form.setFieldValue(
                                                        field.name,
                                                        date,
                                                    )
                                                }}
                                            />
                                        )}
                                    </Field>
                                </FormItem>
                                <FormItem
                                    asterisk
                                    label="Assignees"
                                    invalid={
                                        errors.assignees && touched.assignees
                                    }
                                    errorMessage={errors.assignees}
                                >
                                    <Field
                                        name="assignees"
                                        placeholder="Assignees"
                                    >
                                        {({
                                            field,
                                            form,
                                        }: FieldProps<FormModel>) => (
                                            <Select
                                                isMulti
                                                placeholder="Please Select"
                                                value={values.assignees?.map(
                                                    (userId) => {
                                                        return userData.find(
                                                            (user) =>
                                                                user?.value ===
                                                                userId,
                                                        )
                                                    },
                                                )}
                                                options={userData}
                                                onChange={(selectedUsers) => {
                                                    form.setFieldValue(
                                                        field.name,
                                                        selectedUsers?.map(
                                                            (item) =>
                                                                item.value,
                                                        ),
                                                    )
                                                }}
                                            />
                                        )}
                                    </Field>
                                </FormItem>

                                <FormItem
                                    asterisk
                                    label="Priority"
                                    invalid={Boolean(
                                        errors.priority && touched.priority,
                                    )}
                                    errorMessage={errors.priority as string}
                                >
                                    <Field name="priority">
                                        {({
                                            field,
                                            form,
                                        }: FieldProps<FormModel>) => (
                                            <Segment
                                                className="w-full"
                                                // selectionType="multiple"
                                                value={values.priority}
                                                onChange={(val) =>
                                                    form.setFieldValue(
                                                        field.name,
                                                        val,
                                                    )
                                                }
                                            >
                                                <div className="grid grid-cols-3 gap-4 w-full">
                                                    {segmentSelections.map(
                                                        (segment) => (
                                                            <Segment.Item
                                                                key={
                                                                    segment.value
                                                                }
                                                                value={
                                                                    segment.value
                                                                }
                                                            >
                                                                {({
                                                                    active,
                                                                    onSegmentItemClick,
                                                                    disabled,
                                                                }) => {
                                                                    return (
                                                                        <div className="text-center">
                                                                            <SegmentItemOption
                                                                                hoverable
                                                                                active={
                                                                                    active
                                                                                }
                                                                                disabled={
                                                                                    disabled
                                                                                }
                                                                                defaultGutter={
                                                                                    false
                                                                                }
                                                                                className="relative min-h-[80px] w-full"
                                                                                customCheck={
                                                                                    <HiCheckCircle className="text-indigo-600 absolute top-2 right-2 text-lg" />
                                                                                }
                                                                                onSegmentItemClick={
                                                                                    onSegmentItemClick
                                                                                }
                                                                            >
                                                                                <div className="flex flex-col items-start mx-4">
                                                                                    <h6>
                                                                                        {
                                                                                            segment.value
                                                                                        }
                                                                                    </h6>
                                                                                    <p>
                                                                                        {
                                                                                            segment.desc
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            </SegmentItemOption>
                                                                        </div>
                                                                    )
                                                                }}
                                                            </Segment.Item>
                                                        ),
                                                    )}
                                                </div>
                                            </Segment>
                                        )}
                                    </Field>
                                </FormItem>
                                {/* <FormItem
                                asterisk
                                label="attachments"
                                invalid={Boolean(
                                    errors.attachments && touched.attachments
                                )}
                                errorMessage={errors.attachments as string}
                            >
                                <Field name="attachments">
                                    {({ field, form }: FieldProps<FormModel>) => (
                                        <Upload
                                            beforeUpload={beforeUpload}
                                            fileList={values.attachments}
                                            onChange={(files) =>
                                                form.setFieldValue(field.name, files)
                                            }
                                            onFileRemove={(files) =>
                                                form.setFieldValue(field.name, files)
                                            }
                                        />
                                    )}
                                </Field>
                            </FormItem> */}

                                <FormItem
                                    asterisk
                                    label="Notify Assignees On Change"
                                    invalid={
                                        errors.notifyAssigneesOnChange &&
                                        touched.notifyAssigneesOnChange
                                    }
                                    errorMessage={
                                        errors.notifyAssigneesOnChange
                                    }
                                >
                                    <div>
                                        <Field
                                            name="notifyAssigneesOnChange"
                                            component={Switcher}
                                        />
                                    </div>
                                </FormItem>
                            </div>
                            <FormItem>
                                <Button
                                    loading={isSubmitting}
                                    icon={<BsSave />}
                                    size="sm"
                                    type="submit"
                                    className="ltr:mr-2 rtl:ml-2"
                                >
                                    Save
                                </Button>
                            </FormItem>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default TaskForm
