import React, { useState, useEffect } from "react";
import { Form, Input, message, Modal, Select, Table } from "antd";
import axios from "axios";
import moment from "moment";
import {
  UnorderedListOutlined,
  AreaChartOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Layout from "./../components/Layout/Layout";
import Spinner from "./../components/Spinner";
import Analytics from "../components/Analytics";

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allTransaction, setAllTransaction] = useState([]);
  const [frequency, setFrequency] = useState("");
  const [type, setType] = useState("all");
  const [viewData, setViewData] = useState("table"); //String to toggle between table and analytics view.
  const [editable, setEditable] = useState(null); //Object to store the transaction being edited

  const [form] = Form.useForm();

  // table data attributes
  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      render: (text) => <span>{moment(text).format("YYYY-MM-DD")}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
    },
    {
      title: "Type",
      dataIndex: "type",
    },
    {
      title: "Category",
      dataIndex: "category",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Actions", //give functionality to edit or delete any thing
      render: (text, record) => (
        <div>
          <EditOutlined //icons from ant design  //This is an Ant Design icon used for editing.
            onClick={() => {
              setEditable(record); //When clicked,it sets the record as the editable record and shows the modal for editing.
              setShowModal(true);
            }}
          />
          <DeleteOutlined //icon from antdesign
            className="mx-2" //space between edit and delete button
            onClick={() => {
              handleDelete(record);
            }}
          />
        </div>
      ),
    },
  ];

  const getAllTransactions = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      setLoading(true);
      const res = await axios.get(
        `/api/v1/transactions?userid=${user._id}&frequency=${frequency}&type=${type}`
      );
      setLoading(false);
      setAllTransaction(res.data);
    } catch (error) {
      console.log(error);
      message.error("Problem fetching the transactions");
    }
  };

  useEffect(() => {
    getAllTransactions();
    form.setFieldsValue(editable); // setting the initial state for form
    // eslint-disable-next-line
  }, [frequency, type, form, editable]); //It is called every time one of the dependencies in the dependency array changes (i.e., frequency, type, form, editable).

  // form submit handler
  const handleSubmit = async (values) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      setLoading(true);

      if (editable) {  //here editable is a boolean flag  and editable.id is for that paricular transation
        await axios.put(`/api/v1/transactions?transactionId=${editable._id}`, {  //code is being edited so put request
          payload: {
            ...values,
            userId: user._id,
          },
        }); //Handles form submission, differentiates between adding a new transaction and updating an existing one
        setLoading(false);
        message.success("Transaction Added Successfully");
      } else {
        await axios.post("/api/v1/transactions", {  
          ...values,
          userid: user._id,
        });
        setLoading(false);
        message.success("Transaction Added Successfully");
      }

      setShowModal(false);
      setEditable(null);

      form.resetFields();
      getAllTransactions();
    } catch (error) {
      setLoading(false);
      message.error("Failed to add transaction");
    }
  };

  // delete handler
  const handleDelete = async (record) => {
    try {
      setLoading(true);
      await axios.delete(`/api/v1/transactions?transacationId=${record._id}`);
      setLoading(false);
      message.success("Transaction Deleted!");
      getAllTransactions();
    } catch (error) {
      setLoading(false);
      console.log(error);
      message.error("unable to delete");
    }
  };

  return (
    <Layout>
      {loading && <Spinner />}
      <div className="filters bg-danger">
        <div>
          <h6>Select Date</h6>
          <Select value={frequency} onChange={(values) => setFrequency(values)}>
            <Select.Option value="1">LAST 1 Day</Select.Option>
            <Select.Option value="7">LAST 1 Week</Select.Option>
            <Select.Option value="30">LAST 1 Month</Select.Option>
            <Select.Option value="">All Transactions</Select.Option>
          </Select>
        </div>
        <div>
          <h6>Select Category</h6>
          <Select value={type} onChange={(values) => setType(values)}>
            <Select.Option value="all">ALL Category</Select.Option>
            <Select.Option value="income">INCOME</Select.Option>
            <Select.Option value="expense">EXPENSE</Select.Option>
          </Select>
        </div>
        <div className="switch-icons">
          <UnorderedListOutlined
            className={`mx-2 ${
              viewData === "table" ? "active-icon" : "inactive-icon"
            }`}
            onClick={() => setViewData("table")}
          />
          <AreaChartOutlined
            className={`mx-2 ${
              viewData === "analytics" ? "active-icon" : "inactive-icon"
            }`}
            onClick={() => setViewData("analytics")}
          />
        </div>
        <div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowModal(true);
              form.resetFields();
            }}
          >
            Add New
          </button>
        </div>
      </div>
      <div className="content">
        {viewData === "table" ? (
          <Table
            className="table table-success table-striped bg-warning"
            columns={columns}
            dataSource={allTransaction}
            
          />
        ) : (
          <Analytics allTransaction={allTransaction} />
        )}
      </div>
      <Modal
        title={editable ? "Edit Transaction" : "Add Transaction"}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={false}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          // initialValues={editable} // initial state will be provided by setFieldsValue inside useEffect to get rid of bug realted to not clearing the form value after clicking on adding new item
        >
          <Form.Item
            label="Amount"
            name="amount"
            rules={[
              {
                required: true,
                message: "Please enter the amount.",
              },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Type"
            name="type"
            rules={[
              {
                required: true,
                message: "Please select the type of transaction.",
              },
            ]}
          >
            <Select>
              <Select.Option value="income">Income</Select.Option>
              <Select.Option value="expense">Expense</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Category"
            name="category"
            rules={[
              {
                required: true,
                message: "Please select the category.",
              },
            ]}
          >
            <Select>
              <Select.Option value="salary">Salary</Select.Option>
              <Select.Option value="tip">Tip</Select.Option>
              <Select.Option value="investment">Investment</Select.Option>
              <Select.Option value="food">Food</Select.Option>
              <Select.Option value="movie">Movie</Select.Option>
              <Select.Option value="bills">Bills</Select.Option>
              <Select.Option value="medical">Medical</Select.Option>
              <Select.Option value="fee">Fee</Select.Option>
              <Select.Option value="tax">TAX</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Date"
            name="date"
            rules={[
              {
                required: true,
                message: "Please select the date of transcation.",
              },
            ]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input type="text" />
          </Form.Item>
          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary">
              SAVE
            </button>
          </div>
        </Form>
      </Modal>
    </Layout>
  );
};

export default HomePage;
