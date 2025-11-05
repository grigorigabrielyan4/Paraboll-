import React, { useState, useEffect, useRef } from "react";
import "./style.css";

function App() {
  const canvasRef = useRef(null);
  const [raysOn, setRaysOn] = useState(true);
  const [quizResult, setQuizResult] = useState("");
  const [fbStatus, setFbStatus] = useState("");

  const [feedback, setFeedback] = useState({ name: "", message: "" });

  /* ---------------- Canvas Animation ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    const focus = { x: W * 0.65, y: H * 0.32 };
    const rays = [];

    function spawnRay() {
      rays.push({
        x: Math.random() * W * 0.9,
        y: -10,
        vx: 0,
        vy: 1 + Math.random() * 1.5,
        reflected: false
      });
    }
    for (let i = 0; i < 10; i++) spawnRay();

    function parabolaY(x) {
      const a = 0.0012;
      const x0 = W * 0.2;
      return a * (x - x0) ** 2 + H * 0.55;
    }

    let animationFrame;
    function update() {
      ctx.clearRect(0, 0, W, H);
      // Draw parabola
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#60a5fa";
      for (let x = 0; x <= W; x++) {
        const y = parabolaY(x);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // Draw focus
      ctx.beginPath();
      ctx.fillStyle = "#facc15";
      ctx.arc(focus.x, focus.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "13px Inter";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Ֆոկուս (F)", focus.x + 10, focus.y + 5);
      // Update rays
      for (let i = rays.length - 1; i >= 0; i--) {
        const r = rays[i];
        r.x += r.vx;
        r.y += r.vy;
        const py = parabolaY(r.x);
        if (!r.reflected && r.y >= py) {
          r.reflected = true;
          const dx = focus.x - r.x;
          const dy = focus.y - r.y;
          const len = Math.hypot(dx, dy) || 1;
          r.vx = (dx / len) * 2;
          r.vy = (dy / len) * 2;
        }
        ctx.beginPath();
        ctx.strokeStyle = r.reflected ? "rgba(250,204,21,0.9)" : "rgba(96,165,250,0.9)";
        ctx.lineWidth = r.reflected ? 2.6 : 1.8;
        ctx.moveTo(r.x - r.vx * 2, r.y - r.vy * 2);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();
        if (Math.hypot(r.x - focus.x, r.y - focus.y) < 6) rays.splice(i, 1);
      }
      if (raysOn && rays.length < 30 && Math.random() < 0.04) spawnRay();
      animationFrame = requestAnimationFrame(update);
    }
    update();
    return () => cancelAnimationFrame(animationFrame);
  }, [raysOn]);

  /* ---------------- Read More ---------------- */
  const handleReadMore = () => {
    window.open("https://en.wikipedia.org/wiki/Parabolic_antenna", "_blank", "noopener");
  };

  /* ---------------- Quiz ---------------- */
  const handleQuiz = (correct) => {
    setQuizResult(correct ? "✅ Ճիշտ է — ընդունիչը տեղադրվում է ֆոկուսում։" : "❌ Սխալ. Փորձիր կրկին։");
  };

  /* ---------------- Feedback ---------------- */
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.message) {
      alert("Խնդրում ենք գրել հաղորդագրություն։");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback)
      });
      const data = await res.json();
      if (data.success) {
        setFbStatus("Ուղարկված է հաջողությամբ ✅");
        setFeedback({ name: "", message: "" });
      } else setFbStatus("Սխալ տեղի ունեցավ ❌");
    } catch (err) {
      console.error(err);
      setFbStatus("Սխալ տեղի ունեցավ ❌");
    }
  };

  return (
    <div className="container">
      <section className="card">
        <h2>Պարաբոլային անտենաներ</h2>
        <p>Պարաբոլային անտենան (կամ արբանյակային ափսե) ունի պարաբոլային հայելի, որը կենտրոնացնում է ալիքները մեկ կետում՝ ֆոկուսում։</p>
        <ul>
          <li>Փոխադրում և ընդունում հեռահար ազդանշանների համար</li>
          <li>Բարձր ուղղորդվածություն և ուժեղացում</li>
          <li>Ռադարներ, արբանյակային կապ, աստղագիտություն</li>
        </ul>
        <button onClick={handleReadMore} className="btn">Read More (Wikipedia)</button>
        <button onClick={() => setRaysOn(!raysOn)} className="btn outline">Toggle Rays</button>
      </section>

      <section className="card">
        <h2>Ինտերակտիվ պատկերը (Canvas)</h2>
        <p className="small">Տես ֆոկուսը (դեղին) և ալիքների անդրադարձը:</p>
        <canvas ref={canvasRef} width="720" height="360"></canvas>
      </section>

      <section className="card">
        <h2>Փոքր Թեստ</h2>
        <p>Որտեղ է տեղադրվում ընդունիչը անտենայի դեպքում:</p>
        <button className="btn" onClick={() => handleQuiz(true)}>Ֆոկուսում</button>
        <button className="btn outline" onClick={() => handleQuiz(false)}>Ուղղիչ գծի վրա</button>
        <p className="small">{quizResult}</p>
      </section>

      <section className="card">
        <h2>Ուղարկիր կարծիքը (Feedback)</h2>
        <form onSubmit={handleFeedbackSubmit}>
          <input type="text" placeholder="Անուն (ընտրյալ)" value={feedback.name} onChange={e => setFeedback({...feedback, name: e.target.value})}/>
          <textarea placeholder="Գրիր կարծիքը..." value={feedback.message} onChange={e => setFeedback({...feedback, message: e.target.value})}/>
          <button type="submit" className="btn">Ուղարկել</button>
        </form>
        <p className="small">{fbStatus}</p>
      </section>
    </div>
  );
}

export default App;