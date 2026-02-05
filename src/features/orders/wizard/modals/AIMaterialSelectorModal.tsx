"use client";

import React from "react";
import { Modal } from "react-bootstrap";
import { useAppDispatch } from "@/store/hooks";
import { AIMaterials, AIMaterialsErpProducts } from "@/types/orders";
import { addDraftYliko, removeAIMaterial } from "../../ordersSlice";

export default function AIMaterialSelectorModal({
    show,
    onClose,
    aiMaterials,
    idx
}: {
    show: boolean;
    onClose: () => void;
    aiMaterials: AIMaterials;
    idx: number
}) {
    const dispatch = useAppDispatch();

    function applyMaterial(c: AIMaterialsErpProducts, qty: number) {
        dispatch(addDraftYliko({
            erpGid: c.erp_gid || "",
            aiMatchedErpGid: c.erp_gid || "",
            gid: c.erp_gid || "",
            erp_code: c.erp_code || "",
            erpCode: c.erp_code || "",
            erp_name: c.erp_name || "",
            erpName: c.erp_name || "",
            erp_price: c.erp_price || 0,
            erp_eoppyprice: c.erp_eoppyprice || 0,
            qty,
            total_price: c.erp_price || 0,
            total_eoppyprice: c.erp_eoppyprice || 0,
        }));

        dispatch(removeAIMaterial(idx));
        onClose();
    }

    return (
        <Modal dialogClassName="modal-grow-scroll" show={show} onHide={onClose} centered contentClassName="premium-modal">
            <Modal.Header closeButton>
                <Modal.Title className="h6 mb-0">Αναζήτηση Ιατρού</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="mt-3 modal-results">
                    {aiMaterials.erp_products?.length ? (
                        <div className="list-group">
                            {aiMaterials.erp_products.map((r, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className="list-group-item list-group-item-action"
                                    onClick={() => applyMaterial(r, aiMaterials.synoliki_posotita_eidous)}
                                >
                                    <div className="fw-semibold">{r.erp_name || "—"}</div>
                                    <div className="small text-secondary">Κωδικός: {r.erp_code || "—"}</div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-secondary small text-center py-3">Δεν υπάρχουν αποτελέσματα.</div>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
}
