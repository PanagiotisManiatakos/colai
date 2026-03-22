"use client";

import React from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { SearchBar } from "@/components/ui/SearchBar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PullToRefresh from "@/components/ui/PullToRefresh";
import AppLoader from "@/components/ui/AppLoader";
import WCDiadikasiaCard from "@/features/orders/components/WCDiadikasiaCard";
import { wcCalendar } from "@/types/wc";
import { fetchWCCalendar } from "@/store/wcDiadikasia/wcDiadikasiaSlice";
import { Alert, Button, FormSelect, Modal } from "react-bootstrap";

export default function DiadikasiaWC() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const wcDiadikasia = useAppSelector((s) => s.wcDiadiaksia);
    const listLoading = useAppSelector((s) => s.wcDiadiaksia.loadingList);
    const refreshing = useAppSelector((s) => s.wcDiadiaksia.refreshingList);
    const error = useAppSelector((s) => s.wcDiadiaksia.error);

    const [showFilters, setShowFilters] = React.useState(false)

    const urlSearch = (searchParams.get("search") ?? "").trim();
    const [q, setQ] = React.useState(urlSearch);


    React.useEffect(() => {
        void dispatch(fetchWCCalendar(urlSearch ? { q: urlSearch } : undefined));
    }, [dispatch, urlSearch]);

    const applySearchToUrl = React.useCallback(
        (next: string) => {
            const params = new URLSearchParams(searchParams.toString());
            const trimmed = next.trim();

            if (trimmed) params.set("search", trimmed);
            else params.delete("search");

            const qs = params.toString();
            router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        },
        [pathname, router, searchParams]
    );

    const applyFilters = () => {
        setShowFilters(false)
    }

    const onSubmitSearch = React.useCallback(() => {
        applySearchToUrl(q);
    }, [applySearchToUrl, q]);

    const onClearSearch = React.useCallback(() => {
        applySearchToUrl("");
    }, [applySearchToUrl]);

    const onRefresh = React.useCallback(async () => {
        await dispatch(fetchWCCalendar(urlSearch ? { q: urlSearch, force: true } : { force: true })).unwrap();
    }, [dispatch, urlSearch]);

    const showInitialLoader = listLoading && wcDiadikasia.calendar.length === 0;

    return (
        <div className="h-100 d-flex flex-column" style={{ minHeight: 0 }}>
            <div className="app-card p-2 mb-3">
                <SearchBar
                    placeholder="Αναζήτηση"
                    value={q}
                    onChange={setQ}
                    onSubmit={onSubmitSearch}
                    onClear={onClearSearch}
                />
            </div>
            <PullToRefresh useSelfScroll className="flex-grow-1" onRefresh={onRefresh} isRefreshing={refreshing}>
                {error ? <Alert variant="danger">{error}</Alert>
                    : showInitialLoader ? (
                        <AppLoader label="Φόρτωση ημερολόγιο WC" />
                    ) : wcDiadikasia.calendar.length ? (
                        <div className="d-flex flex-column gap-2">
                            {wcDiadikasia.calendar.map((r: wcCalendar) => (
                                <WCDiadikasiaCard key={r.task_CODE}
                                // request={r}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="app-card p-4 text-center text-secondary">Δεν βρέθηκαν WC διαδικασίες</div>
                    )}
            </PullToRefresh>

            <Button
                onClick={() => setShowFilters(true)}
                className="app-fab btn btn-primary rounded-circle shadow d-flex align-items-center justify-content-center"
                style={{ width: 56, height: 56 }}
            >
                <i className={`bi bi-filter`} style={{ fontSize: "1.25rem" }} />
            </Button>
            <Modal
                show={showFilters}
                onHide={() => setShowFilters(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title >Φίλτρα WC</Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    <label className="form-label small text-secondary mb-2">Area-Team</label>
                    <FormSelect aria-label="Area-Team">
                        {/* <option value="4">WC</option> */}
                    </FormSelect>
                    <label className="form-label small text-secondary mb-2">Πωλητής</label>
                    <FormSelect aria-label="Πωλητής">
                        {/* <option value="4">WC</option> */}
                    </FormSelect>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={applyFilters}>Εφαρμογή</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
