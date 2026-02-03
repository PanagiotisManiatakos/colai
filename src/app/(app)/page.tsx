import HomeStats from "@/components/home/HomeStats";

export default function HomePage() {
  return (<div className="d-flex flex-column h-100" style={{ minHeight: 0 }}>
    <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
      <HomeStats />
    </div>
  </div>)



}
