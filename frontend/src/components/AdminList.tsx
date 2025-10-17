import React, { useEffect, useState } from "react";
import { Check, Trash2, Key } from "lucide-react";
import { Table, Button, Space, Popconfirm, Tooltip, Modal, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { User } from "../types";
import { useUserStore } from "../stores/usersStore";
import { useAuth } from "../contexts/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";
import ResetPassword from "../pages/ResetPassword"; 
import { toast } from "sonner";

export const AdminList: React.FC = () => {
  const { users, loading, fetchAdminUsers, approveUser, deleteUser } = useUserStore();
  const { token } = useAuth();

  // modal state for password reset
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminUsers();
  }, [fetchAdminUsers]);

  const openResetModal = (id: string) => {
    setSelectedUserId(id);
    setResetModalVisible(true);
  };

  const closeResetModal = () => {
    setResetModalVisible(false);
    setSelectedUserId(null);
  };

  const handleResetSuccess = (msg?: string) => {
    message.success(msg || "Password reset successful");
    closeResetModal();
  };

  // AntD columnsType with responsive settings
  const columns: ColumnsType<User> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <div className="flex flex-col">
          <span className="text-base font-semibold text-gray-800 truncate">{text}</span>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      responsive: ["sm"],
      render: (text: string) => <span className="text-sm text-gray-600 truncate">{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      responsive: ["xs", "sm", "md"],
      render: (_: any, user: User) => (
        <span
          className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
            user.approved === false ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {user.approved === false ? "Pending" : "Approved"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, user: User) => (
        <div className="flex items-center">
          <Space size="small" className="!flex-nowrap">
            {user.approved === false && (
              <>
                <div className="hidden sm:block">
                  <Button
                    type="primary"
                    icon={<Check size={16} />}
                    onClick={() => {
                      approveUser(user._id, token || "");
                      toast.success("User approved successfully!");
                    }}
                    size="small"
                    className="!bg-blue-600 !border-blue-600 !text-white hover:!bg-blue-700"
                  >
                    Approve
                  </Button>
                </div>

                <div className="block sm:hidden">
                  <Tooltip title="Approve">
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<Check size={14} />}
                      onClick={() => {
                        approveUser(user._id, token || "");
                        toast.success("User approved successfully!");
                      }}
                      size="small"
                      className="!bg-blue-600 !border-blue-600 !text-white hover:!bg-blue-700"
                    />
                  </Tooltip>
                </div>
              </>
            )}

            {/* Reset Password - full button on sm+, icon-only on xs */}
            <div className="hidden sm:block">
              <Tooltip title="Reset Password">
                <Button
                  type="default"
                  icon={<Key size={16} />}
                  onClick={() => openResetModal(user._id)}
                  size="small"
                >
                  Reset Password
                </Button>
              </Tooltip>
            </div>

            <div className="block sm:hidden">
              <Tooltip title="Reset Password">
                <Button
                  type="default"
                  shape="circle"
                  icon={<Key size={14} />}
                  onClick={() => openResetModal(user._id)}
                  size="small"
                />
              </Tooltip>
            </div>

            {/* Delete */}
            <div className="hidden sm:block">
              <Popconfirm
                title="Are you sure to delete this user?"
                onConfirm={() => {
                  deleteUser(user._id, token || "");
                  toast.success("User deleted successfully!");
                }}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  danger
                  icon={<Trash2 size={16} />}
                  size="small"
                  className="!bg-red-600 !border-red-600 !text-white hover:!bg-red-700"
                >
                  Delete
                </Button>
              </Popconfirm>
            </div>

            <div className="block sm:hidden">
              <Tooltip title="Delete">
                <Popconfirm
                  title="Confirm delete?"
                  onConfirm={() => {
                    deleteUser(user._id, token || "");
                    toast.success("User deleted successfully!");
                  }}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    danger
                    shape="circle"
                    icon={<Trash2 size={14} />}
                    size="small"
                    className="!bg-red-600 !border-red-600 !text-white hover:!bg-red-700"
                  />
                </Popconfirm>
              </Tooltip>
            </div>
          </Space>
        </div>
      ),
    },
  ];

  const dataSource = users.map(u => ({ ...u, key: u._id ?? u.email }));

  return (
    <>
      <div className="max-w-3xl mx-auto mt-10 p-6 sm:p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">List of Hospital Administrators</h2>

        <div className="w-full overflow-x-auto -mx-6 px-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <LoadingSpinner />
            </div>
          ) : (
            <Table
              dataSource={dataSource}
              columns={columns}
              rowKey="key"
              pagination={{ pageSize: 5 }}
              className="min-w-[600px] rounded-lg overflow-hidden"
            />
          )}
        </div>
      </div>

      {/* Password Reset Modal */}
      <Modal
        title="Reset admin password"
        visible={resetModalVisible}
        onCancel={closeResetModal}
        footer={null}
        destroyOnClose
        maskClosable
      >
        {selectedUserId ? (
          <ResetPassword
            mode="admin"
            userId={selectedUserId}
            onSuccess={(msg?: string) => handleResetSuccess(msg)}
            onClose={closeResetModal}
          />
        ) : (
          <div className="py-8 text-center">No user selected</div>
        )}
      </Modal>
    </>
  );
};

export default AdminList;
