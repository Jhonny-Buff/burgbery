export function Map() {
  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden border border-zinc-800 mb-12">
      <iframe
        src="https://yandex.ru/map-widget/v1/?ll=38.288533%2C46.690635&mode=search&ol=geo&ouri=ymapsbm1%3A%2F%2Fgeo%3Fdata%3DCgg1NjgzNzU5MRKCAdjQoNC-0YHRgdC40Y8sINCa0YDQsNGB0L3QvtC00LDRgNGB0LrQuNC5INC60YDQsNC5LCDQldC50YHQui4g0YPQu9C40YbQsCDQn9C70LXRhdCw0L3QvtCy0LAsINC00L7QvCAxNSwg0LrQvtGA0L_Rg9GBIDQiCg11JxlCFTbDOkI&z=18.57"
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        style={{ position: 'relative' }}
      />
    </div>
  );
}
