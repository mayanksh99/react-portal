import React, { useEffect, useState } from "react";
import {
	Table,
	Divider,
	Tag,
	Card,
	Icon,
	Drawer,
	Popconfirm,
	Form,
	Button,
	Input,
	DatePicker,
	TimePicker,
	Row,
	Checkbox,
	Col
} from "antd";
import moment from "moment";

import "./style.css";
import { getEventService, addEventService } from "../../utils/services";
import { _notification } from "../../utils/_helpers";
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const CreateEvent = props => {
	const format = "h:mm a";
	const [event, setEvent] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [title, setTitle] = useState(null);
	const [description, setDescription] = useState(null);
	const [venue, setVenue] = useState(null);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [startTime, setStartTime] = useState(null);
	const [endTime, setEndTime] = useState(null);
	const [isRegistrationRequired, setIsRegReqd] = useState(null);
	const [isRegistrationOpened, setIsRegOpen] = useState(null);

	const { getFieldDecorator } = props.form;

	useEffect(() => {
		(async () => {
			try {
				const id = props.eventId;
				const res = await getEventService(id);
				console.log(res);
				if (res.message === "success") {
					setEvent(res.data);
				} else {
					_notification("warning", "Error", res.message);
				}
			} catch (err) {
				_notification("error", "Error", err.message);
			}
		})();
	}, []);

	useEffect(() => {
		if (event) {
			let {
				startDate,
				endDate,
				time,
				title,
				description,
				isRegistrationOpened,
				isRegistrationRequired,
				venue
			} = event;

			props.form.setFieldsValue({
				startTime: moment(time.split(" to ")[0], format),
				endTime: moment(time.split(" to ")[1], format),
				// startDate: moment(startDate),
				// endDate: moment(endDate),
				dates: [
					moment(startDate, "YYYY-MM-DD"),
					moment(endDate, "YYYY-MM-DD")
				],
				title,
				description,
				isRegistrationOpened,
				isRegistrationRequired,
				venue
			});
		}
	}, [event]);

	function disabledDate(current) {
		// Can not select days before today and today
		return current && current < moment().endOf("day");
	}

	const onDateRangeChange = (date, dateString) => {
		setStartDate(dateString[0]);
		setEndDate(dateString[1]);
	};

	function onSTChange(time, timeString) {
		setStartTime(timeString);
	}

	function onETChange(time, timeString) {
		setEndTime(timeString);
	}

	const handleSubmit = e => {
		e.preventDefault();
		setIsLoading(true);
		if (isRegistrationRequired === false) {
			setIsRegOpen(false);
		}
		props.form.validateFields(async (err, values) => {
			if (!err) {
				try {
					let days = endDate.split("-")[2] - startDate.split("-")[2];
					let data = {
						title,
						description,
						startDate,
						endDate,
						time: startTime + " to " + endTime,
						venue,
						isRegistrationRequired,
						isRegistrationOpened,
						days
					};
					const res = await addEventService(data);
					if (res.message === "success") {
						_notification("success", "Success", "Event Added");
						props.onAddEvent();
					} else {
						_notification("error", "Error", res.message);
					}
					setIsLoading(false);
				} catch (err) {
					_notification("error", "Error", err.message);
					setIsLoading(false);
				}
			} else {
				setIsLoading(false);
			}
		});
	};

	return (
		<Form onSubmit={handleSubmit} layout="vertical">
			<Form.Item label="Event Title" required>
				{getFieldDecorator("title", {
					rules: [
						{
							required: true,
							message: "Please input event title!"
						}
					]
				})(
					<Input
						type="text"
						placeholder="Event title"
						onChange={e => setTitle(e.target.value)}
					/>
				)}
			</Form.Item>
			<Form.Item label="Description" required>
				{getFieldDecorator("description", {
					rules: [
						{
							require: true,
							message: "Please enter description!"
						}
					]
				})(
					<TextArea
						rows={4}
						placeholder="Enter event description"
						onChange={e => setDescription(e.target.value)}
					/>
				)}
			</Form.Item>

			<Form.Item label="Event Venue" required>
				{getFieldDecorator("venue", {
					rules: [
						{
							required: true,
							message: "Please input event venue!"
						}
					]
				})(
					<Input
						type="text"
						placeholder="Event venue"
						onChange={e => setVenue(e.target.value)}
					/>
				)}
			</Form.Item>

			<Form.Item label="Event Dates" required>
				{getFieldDecorator("dates", {
					rules: [
						{
							required: true,
							message: "Please select event dates!"
						}
					]
				})(
					<RangePicker
						style={{ width: "100%" }}
						disabledDate={disabledDate}
						format="YYYY-MM-DD"
						onChange={onDateRangeChange}
					/>
				)}
			</Form.Item>

			<Row gutter={16}>
				<Col span={12}>
					<Form.Item label="Start Time" required>
						{getFieldDecorator("startTime", {
							rules: [
								{
									required: true,
									message: "Please select event timings!"
								}
							]
						})(
							<TimePicker
								use12Hours
								format="h:mm a"
								onChange={onSTChange}
								style={{ width: "100%" }}
								format={format}
							/>
						)}
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item label="End Time" required>
						{getFieldDecorator("endTime", {
							rules: [
								{
									required: true,
									message: "Please select event timings!"
								}
							]
						})(
							<TimePicker
								use12Hours
								format="h:mm a"
								onChange={onETChange}
								style={{ width: "100%" }}
								format={format}
							/>
						)}
					</Form.Item>
				</Col>
			</Row>

			<Row gutter={16}>
				<Col span={12}>
					<Form.Item>
						{getFieldDecorator(
							"isRegistrationRequired",
							{}
						)(
							<Checkbox
								checked={isRegistrationRequired}
								onChange={e => setIsRegReqd(e.target.checked)}
							>
								Is Registration Required?
							</Checkbox>
						)}
					</Form.Item>
				</Col>

				<Col span={12}>
					<Form.Item
						hidden={isRegistrationRequired === false ? true : false}
					>
						{getFieldDecorator(
							"isRegistrationOpened",
							{}
						)(
							<Checkbox
								checked={isRegistrationOpened}
								onChange={e => setIsRegOpen(e.target.checked)}
							>
								Is Registration Open?
							</Checkbox>
						)}
					</Form.Item>
				</Col>
			</Row>

			<Form.Item>
				<Button
					type="primary"
					htmlType="submit"
					className="login-form-button"
					loading={isLoading}
				>
					Add Event
				</Button>
			</Form.Item>
		</Form>
	);
};

const CreateEventForm = Form.create({ name: "event_form" })(CreateEvent);

export default CreateEventForm;
