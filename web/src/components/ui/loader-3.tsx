// 3D "stacking boxes" loader — pure CSS animation.
// Source: 21st.dev community component "loader-3" (ravikatiyar).
// All animation/styling lives in src/styles/tailwind.css (.loader / .box / .ground);
// this component is just static markup, so Astro renders it to HTML with zero JS
// (no `client:*` directive needed — there is no state or interactivity).
export const Loader3 = () => {
  return (
    <div className="loader" role="status" aria-label="Loading">
      <div className="box box0"><div /></div>
      <div className="box box1"><div /></div>
      <div className="box box2"><div /></div>
      <div className="box box3"><div /></div>
      <div className="box box4"><div /></div>
      <div className="box box5"><div /></div>
      <div className="box box6"><div /></div>
      <div className="box box7"><div /></div>
      <div className="ground"><div /></div>
    </div>
  );
};

export default Loader3;
