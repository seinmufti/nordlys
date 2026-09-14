type HostedAppFrameProps = {
  src: string;
  title: string;
  allow: string;
};

export function HostedAppFrame({ src, title, allow }: HostedAppFrameProps) {
  return (
    <iframe
      src={src}
      title={title}
      className="hosted-app-frame"
      allow={allow}
    />
  );
}
