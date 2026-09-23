import React, { useState } from "react";
import { useTable } from "@refinedev/antd";
import { useDelete, useCustomMutation } from "@refinedev/core";
import { CreateButton, List } from "@refinedev/antd";
import { useNavigate } from "react-router-dom";
import { ResponsiveTable } from "../../components/ResponsiveTable";
import { ConfirmDeleteModal } from "../../components/ConfirmDeleteModal";
import { message, Tag, Typography } from "antd";

const { Text } = Typography;

const API_URL = "https://scarfminiappbale-api.abdollahi003.workers.dev";

export const VariantList: React.FC = () => {
  const { tableProps } = useTable({ pagination: { pageSize: 50 } });
  const { mutate: remove } = useDelete();
  const { mutate: reorder } = useCustomMutation();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [localOrder, setLocalOrder] = useState<any[] | null>(null);

  const rows: any[] = localOrder ?? [...(tableProps.dataSource ?? [])];

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDeleting(true);
    remove(
      { resource: "variants", id: deleteTarget.id },
      {
        onSuccess: () => {
          message.success("متغیر با موفقیت حذف شد");
          setDeleteTarget(null);
          setDeleting(false);
          setLocalOrder(null);
        },
        onError: () => {
          message.error("خطا در حذف متغیر");
          setDeleting(false);
        },
      }
    );
  };

  const handleReorder = (newOrder: any[]) => {
    setLocalOrder(newOrder);
    const orderedIds = newOrder.map((r) => Number(r.id)).filter((n) => Number.isFinite(n));
    reorder(
      {
        url: `${API_URL}/api/bale-admin/variants/reorder`,
        method: "put",
        values: { ordered_ids: orderedIds },
      },
      {
        onSuccess: () => message.success("ترتیب نمایش ذخیره شد"),
        onError: () => {
          message.error("خطا در ذخیره ترتیب");
          setLocalOrder(null);
        },
      }
    );
  };

  const columns = [
    { key: "index", title: "ردیف", width: 60, render: (_: unknown, __: unknown, index: number) => index + 1 },
    {
      key: "product_name",
      title: "محصول",
      dataIndex: "product_name",
      render: (name: string, record: any) => <Text strong>{name || `#${record.product_id}`}</Text>,
    },
    {
      key: "design_name",
      title: "طرح",
      dataIndex: "design_name",
      render: (name: string) => name ? <Tag color="blue">{name}</Tag> : <Tag>-</Tag>,
    },
    {
      key: "colors",
      title: "رنگ‌ها",
      dataIndex: "colors",
      render: (colors: any[]) => (
        <span style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {(colors || []).map((c: any) => (
            <span key={c.id} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: c.hex, border: "1px solid #E5E7EB", display: "inline-block" }} />
              <span style={{ fontSize: 12 }}>{c.name}</span>
            </span>
          ))}
          {(!colors || colors.length === 0) && <Text type="secondary">-</Text>}
        </span>
      ),
    },
    {
      key: "sizes",
      title: "سایزها",
      dataIndex: "sizes",
      render: (sizes: any[]) => (
        <span style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {(sizes || []).map((s: any) => (
            <Tag key={s.id}>{s.dimensions}</Tag>
          ))}
          {(!sizes || sizes.length === 0) && <Text type="secondary">-</Text>}
        </span>
      ),
    },
    {
      key: "is_stock",
      title: "موجودی",
      dataIndex: "is_stock",
      width: 90,
      render: (v: number) => <Tag color={v ? "green" : "red"}>{v ? "موجود" : "ناموجود"}</Tag>,
    },
  ];

  return (
    <div>
      <List headerProps={{ title: "متغیرها", extra: <CreateButton /> }}>
        <div style={{ marginBottom: 12, padding: "10px 14px", background: "#F5F0FF", border: "1px solid #DDD0FA", borderRadius: 12, fontSize: 13, color: "#5B21B6", lineHeight: 1.8 }}>
          ردیف‌ها را با درگ بکشید تا ترتیب نمایش در مینی‌اپ (QuickBuy) مشخص شود: اول سایز بزرگ‌تر، بعد تک‌سایزها، بعد سایز کوچک‌تر — ترتیب داخل هر گروه از همین لیست می‌آید.
        </div>
        <ResponsiveTable
          dataSource={rows}
          loading={!!tableProps.loading}
          rowKey="id"
          mobileCardTitle={(record: any) => record.product_name || `محصول #${record.product_id}`}
          mobileCardSubtitle={(record: any) => record.design_name || "-"}
          columns={columns}
          sortable
          onReorder={handleReorder}
          actions={{
            onEdit: (record) => navigate(`/variants/edit/${record.id}`),
            onDelete: (record) => setDeleteTarget(record),
          }}
        />
      </List>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="آیا از حذف این متغیر مطمئن هستید؟"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};
