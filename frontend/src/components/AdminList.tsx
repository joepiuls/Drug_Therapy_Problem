import React, { useEffect } from "react";
import {Check, Trash2 } from "lucide-react";
import {Table, Button, Space, Popconfirm} from "antd";
import type { User } from "../types";
import { useUserStore } from "../stores/usersStore";
import { useAuth } from "../contexts/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";
import type { ColumnsType } from "antd/es/table";
import { Tooltip } from "antd";



export const AdminList: React.FC = () => {
    const { users, loading, fetchAdminUsers, approveUser, deleteUser } = useUserStore();
    const { token } = useAuth();

    useEffect(() => {
        fetchAdminUsers();
    }, [fetchAdminUsers]);

    
      // AntD columnsType with responsive settings
      const columns: ColumnsType<User> = [
        {
          title: "Name",
          dataIndex: "name",
          key: "name",
          // always visible, makes the cell slightly larger on mobile via tailwind classes
          render: (text: string) => (
            <div className="flex flex-col">
              <span className="text-base font-semibold text-gray-800 truncate">{text}</span>
            </div>
          ),
        },
        {
          title: "Email",
          dataIndex: "email",
          key: "email",
          // hide on xs screens
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
          // keep actions visible on all breakpoints, but render compact UI on small screens
          render: (_: any, user: User) => (
            <div className="flex items-center">
              <Space size="small" className="!flex-nowrap">
                {/* Approve button - hide the text on xs screens */}
                {user.approved === false && (
                  <>
                    <div className="hidden sm:block">
                      <Button
                        type="primary"
                        icon={<Check size={16} />}
                        onClick={() => approveUser(user._id, token || "")}
                        size="small"
                        className="!bg-blue-600 !border-blue-600 !text-white hover:!bg-blue-700"
                      >
                        Approve
                      </Button>
                    </div>
    
                    {/* Icon-only for small screens */}
                    <div className="block sm:hidden">
                      <Tooltip title="Approve">
                        <Button
                          type="primary"
                          shape="circle"
                          icon={<Check size={14} />}
                          onClick={() => approveUser(user._id, token || "")}
                          size="small"
                          className="!bg-blue-600 !border-blue-600 !text-white hover:!bg-blue-700"
                        />
                      </Tooltip>
                    </div>
                  </>
                )}
    
                {/* Delete - full button on sm+, icon only on xs */}
                <div className="hidden sm:block">
                  <Popconfirm
                    title="Are you sure to delete this user?"
                    onConfirm={() => deleteUser(user._id, token || "")}
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
                      onConfirm={() => deleteUser(user._id, token || "")}
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
        <div className="max-w-3xl mx-auto mt-10 p-6 sm:p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">List of Hospital Administrators</h2>
    
          {/* Responsive wrapper: allow horizontal scroll on very small screens */}
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
      );
    };
    


    

