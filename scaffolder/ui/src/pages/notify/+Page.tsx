import {useState} from "react";

export default function Page() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email.trim()) {
            return;
        }
        setSubmitted(true);
    };

    return (
        <main className="page">
            <header className="page-header">
                <div>
                    <p className="eyebrow">Preconfigured system</p>
                    <h1>Get notified when it’s ready</h1>
                    <p className="subtitle">
                        Leave your email and we’ll let you know when the preconfigured subscription system is available.
                    </p>
                </div>
            </header>

            <section className="panel">
                {submitted ? (
                    <div className="notify-success">
                        <h2>Thanks!</h2>
                        <p>We’ll notify you when the system is ready.</p>
                        <button type="button" className="ghost-button" onClick={() => setSubmitted(false)}>
                            Submit another email
                        </button>
                    </div>
                ) : (
                    <form className="notify-form" onSubmit={handleSubmit}>
                        <label htmlFor="notify-email">Email</label>
                        <input
                            id="notify-email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                        <button type="submit" className="primary-button">
                            Notify me
                        </button>
                    </form>
                )}
            </section>
        </main>
    );
}
