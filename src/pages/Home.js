import React from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import '../styles/Home.css';

let homeImage;
let featureImage;
let programImage;

try { homeImage = require('../Assets/home page.png'); } catch { homeImage = null; }
try { featureImage = require('../Assets/fetch page.png'); } catch { featureImage = null; }
try { programImage = require('../Assets/home page2222.png'); } catch { programImage = null; }

const Home = () => {
    return (
        <div className="home-container">
            <section className="hero-section">
                <div className="hero-content">
                    <p className="hero-eyebrow hero-animate-in">Funded Trading Platform</p>
                    <h1 className="hero-headline">
                        <span className="hero-line hero-line-1">Fast payouts in 5 days.</span>
                        <span className="hero-line hero-line-2">Affordable plans. High leverage.</span>
                    </h1>
                    <p className="hero-description">
                        Up to ₹1,00,000 trading balance per user · Real-money payouts on profit ·
                        No payment for losses · Forex option trading in INR
                    </p>
                    <div className="hero-actions">
                        <Link to="/plans" className="btn-primary">View Plans</Link>
                        <Link to="/signup" className="btn-secondary">Get Started</Link>
                    </div>
                </div>
                {homeImage && (
                    <div className="hero-visual glass-card funding-card">
                        <img src={homeImage} alt="" />
                    </div>
                )}
            </section>

            <section className="stats-grid">
                <div className="stat-card glass-card funding-card">
                    <strong>24/7</strong>
                    <span>On-site chat support</span>
                </div>
                <div className="stat-card glass-card funding-card">
                    <strong>50%</strong>
                    <span>Payout profit share</span>
                </div>
                <div className="stat-card glass-card funding-card">
                    <strong>5 Days</strong>
                    <span>Each trading cycle</span>
                </div>
                <div className="stat-card glass-card funding-card">
                    <strong>No Limit</strong>
                    <span>Real-money payouts</span>
                </div>
            </section>

            <section className="home-section">
                <SectionHeading
                    kicker="Process"
                    title="How it works"
                    subtitle="A simple three-step path from signup to funded trading and real payouts."
                />
                <div className="steps-grid">
                    <div className="step-card glass-card funding-card">
                        <span className="step-number">01</span>
                        <h3>Setting up</h3>
                        <p>Select the best membership plan, complete payment, and activate your account.</p>
                    </div>
                    <div className="step-card glass-card funding-card">
                        <span className="step-number">02</span>
                        <h3>Trade</h3>
                        <p>Receive access within 24–48 hours and start trading on your funded balance.</p>
                    </div>
                    <div className="step-card glass-card funding-card">
                        <span className="step-number">03</span>
                        <h3>Real-money payout</h3>
                        <p>Request payouts after hitting profit targets on the web trader or mobile app.</p>
                    </div>
                </div>
            </section>

            <section className="home-section" id="plans">
                <SectionHeading
                    kicker="Funding tiers"
                    title="Membership plans"
                    subtitle="Compare balances, margins, and lifecycle rules across every LeverageX plan."
                />
                <div className="plans-table-wrap glass-card funding-card">
                    <table className="plans-table">
                        <thead>
                            <tr>
                                <th>Plan</th>
                                <th>Trading Balance</th>
                                <th>Min Days</th>
                                <th>Margin</th>
                                <th>Plan Cost</th>
                                <th>Lifecycle</th>
                                <th>Max Loss</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span className="plan-pill rapid">Rapid</span></td>
                                <td>₹10,000</td>
                                <td>5 Days</td>
                                <td>10X</td>
                                <td>₹1,000</td>
                                <td>One Time</td>
                                <td>10%</td>
                            </tr>
                            <tr>
                                <td><span className="plan-pill evolution">Evolution</span></td>
                                <td>₹50,000</td>
                                <td>5 Days</td>
                                <td>10X</td>
                                <td>₹5,000</td>
                                <td>Unlimited</td>
                                <td>10%</td>
                            </tr>
                            <tr>
                                <td><span className="plan-pill prime">Prime</span></td>
                                <td>₹1,00,000</td>
                                <td>5 Days</td>
                                <td>10X</td>
                                <td>₹10,000</td>
                                <td>Unlimited</td>
                                <td>10%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="home-section">
                <SectionHeading
                    kicker="Platform"
                    title="Features"
                    subtitle="Built for funded traders who want speed, transparency, and real upside."
                />
                <div className="feature-split">
                    {featureImage && (
                        <div className="feature-visual glass-card funding-card">
                            <img src={featureImage} alt="" />
                        </div>
                    )}
                    <ul className="feature-list">
                        <li className="funding-card">Real-money payout on profits</li>
                        <li className="funding-card">No payment for losses</li>
                        <li className="funding-card">Unlimited accounts per user</li>
                        <li className="funding-card">No upper limit on real-money payouts</li>
                        <li className="funding-card">Mystery rewards for consistent traders</li>
                    </ul>
                </div>
            </section>

            <section className="home-section">
                <SectionHeading
                    kicker="Pricing"
                    title="Choose your plan"
                    subtitle="Pick the funding level that matches your experience and trading goals."
                />
                <div className="plan-cards">
                    <article className="plan-card glass-card funding-card">
                        <span className="plan-pill rapid">Rapid</span>
                        <h3>₹1,000</h3>
                        <p>Start small and fast with leveraged capital and a low entry barrier.</p>
                    </article>
                    <article className="plan-card glass-card funding-card featured">
                        <span className="plan-pill evolution">Evolution</span>
                        <h3>₹5,000</h3>
                        <p>More capital and flexibility for traders ready to scale their strategy.</p>
                    </article>
                    <article className="plan-card glass-card funding-card">
                        <span className="plan-pill prime">Prime</span>
                        <h3>₹10,000</h3>
                        <p>Maximum funding for experienced traders who want to operate at scale.</p>
                    </article>
                </div>
            </section>

            <section className="cta-banner glass-card funding-card">
                <h2>Join our community of funded traders</h2>
                <p>Thousands of traders have already joined. Scale your operations with real capital backing.</p>
                <Link to="/signup" className="btn-primary">Create Account</Link>
            </section>

            {programImage && (
                <section className="home-section program-section">
                    <SectionHeading
                        kicker="Community"
                        title="Why join our program?"
                        subtitle="LeverageX gives every trader a professional path to funded capital."
                    />
                    <div className="feature-split">
                        <div className="program-copy">
                            <div className="program-point funding-card">
                                <h3>Plans for every trader</h3>
                                <p>From beginners to experienced professionals, choose the funding level that fits you.</p>
                            </div>
                            <div className="program-point funding-card">
                                <h3>Small investment, huge potential</h3>
                                <p>Get funded with real capital for as little as ₹1,000.</p>
                            </div>
                            <div className="program-point funding-card">
                                <h3>Dedicated support</h3>
                                <p>Round-the-clock assistance to help you trade safely and confidently.</p>
                            </div>
                        </div>
                        <div className="feature-visual glass-card funding-card">
                            <img src={programImage} alt="" />
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;
