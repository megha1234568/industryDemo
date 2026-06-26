import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import seaborn as sns
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report, confusion_matrix,
    roc_auc_score, roc_curve, precision_recall_curve,
    average_precision_score, ConfusionMatrixDisplay
)

# ─────────────────────────────────────────────────────────────
# 1. SIMULATE SENSOR DATA
# ─────────────────────────────────────────────────────────────
np.random.seed(42)
N = 3000

print("=" * 60)
print("  AUTOMATION INDUSTRY — PREDICTIVE MAINTENANCE")
print("  Logistic Regression Demo")
print("=" * 60)
print(f"\n[1/5] Generating {N:,} synthetic sensor readings...")

# Continuous sensor features
temperature   = np.random.normal(92,  18,  N).clip(40, 160)   # °C
vibration     = np.random.exponential(5,   N).clip(0,  30)    # mm/s
cycle_time    = np.random.normal(400, 75,  N).clip(150, 700)  # ms per cycle
tool_wear     = np.random.uniform(0,  100, N)                  # % worn
oil_pressure  = np.random.normal(5.5, 1.4, N).clip(0.5, 10)  # bar
motor_current = np.random.normal(22,  7,   N).clip(4,  55)    # Ampere
humidity      = np.random.normal(55,  15,  N).clip(10, 95)    # %RH
rpm           = np.random.normal(1450, 200, N).clip(600, 2200) # RPM

# Categorical: shift (0=day, 1=evening, 2=night)
shift = np.random.choice([0, 1, 2], N, p=[0.4, 0.35, 0.25])

# ── Failure label via realistic logistic model ────────────────
logit = (
    -1.7                                       # intercept → ~15% base rate
    + 0.8    * (temperature   - 92)   / 18    # high temp → fail
    + 1.5    * (vibration     - 5)    / 5     # vibration → fail
    + 0.4    * (cycle_time    - 400)  / 75    # slow cycle → fail
    + 0.7    * (tool_wear     - 50)   / 25    # worn tool  → fail
    - 1.2    * (oil_pressure  - 5.5)  / 1.4   # low oil    → fail
    + 0.6    * (motor_current - 22)   / 7     # high amps  → fail
    + 0.2    * (humidity      - 55)   / 15    # humidity   → fail (minor)
    - 0.3    * (rpm           - 1450) / 200   # stable RPM → ok
    + 0.5    * (shift == 2).astype(float)     # night shift → higher risk
)
prob_fail = 1 / (1 + np.exp(-logit))
failure   = (np.random.rand(N) < prob_fail).astype(int)

df = pd.DataFrame({
    'temperature':   temperature,
    'vibration':     vibration,
    'cycle_time':    cycle_time,
    'tool_wear':     tool_wear,
    'oil_pressure':  oil_pressure,
    'motor_current': motor_current,
    'humidity':      humidity,
    'rpm':           rpm,
    'shift':         shift,
    'failure':       failure,
})

print(f"    Rows: {len(df):,}  |  Features: {df.shape[1]-1}")
print(f"    Failures: {failure.sum():,} ({failure.mean()*100:.1f}%)  |"
      f"  Operational: {(1-failure).sum():,} ({(1-failure).mean()*100:.1f}%)")

# ─────────────────────────────────────────────────────────────
# 2. PREPROCESSING
# ─────────────────────────────────────────────────────────────
print("\n[2/5] Preprocessing...")

feature_cols = ['temperature', 'vibration', 'cycle_time', 'tool_wear',
                'oil_pressure', 'motor_current', 'humidity', 'rpm', 'shift']
X = df[feature_cols].values
y = df['failure'].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler  = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test  = scaler.transform(X_test)

print(f"    Train: {len(X_train):,} samples  |  Test: {len(X_test):,} samples")

# ─────────────────────────────────────────────────────────────
# 3. TRAIN MODEL
# ─────────────────────────────────────────────────────────────
print("\n[3/5] Training Logistic Regression (lbfgs, C=1.0)...")

model = LogisticRegression(
    solver='lbfgs',
    max_iter=1000,
    C=1.0,
    class_weight='balanced',
    random_state=42
)
model.fit(X_train, y_train)

cv   = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
aucs = cross_val_score(model, X_train, y_train, cv=cv, scoring='roc_auc')
print(f"    5-Fold CV AUC: {aucs.mean():.4f} ± {aucs.std():.4f}")
print(f"    Fold scores  : {np.round(aucs, 4)}")

# ─────────────────────────────────────────────────────────────
# 4. EVALUATE
# ─────────────────────────────────────────────────────────────
print("\n[4/5] Evaluating on test set...")

y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]
auc    = roc_auc_score(y_test, y_prob)
ap     = average_precision_score(y_test, y_prob)

print("\n" + "─" * 55)
print(classification_report(y_test, y_pred,
      target_names=["Operational (0)", "Failure (1)"]))
print(f"  AUC-ROC  : {auc:.4f}")
print(f"  Avg Prec : {ap:.4f}")
print("─" * 55)

# Coefficients table
coef_df = pd.DataFrame({
    'Feature':     feature_cols,
    'Coefficient': model.coef_[0],
    'Odds Ratio':  np.exp(model.coef_[0]),
}).sort_values('Coefficient', ascending=False)
print("\n  Feature Coefficients:")
print(coef_df.to_string(index=False, float_format='%.4f'))

# ─────────────────────────────────────────────────────────────
# 5. VISUALISE
# ─────────────────────────────────────────────────────────────
print("\n[5/5] Generating plots...")

plt.style.use('dark_background')
fig = plt.figure(figsize=(18, 14), facecolor='#0b0e14')
fig.suptitle("Logistic Regression — Predictive Maintenance\nAutomation Industry",
             fontsize=16, fontweight='bold', color='white', y=0.98)

gs = gridspec.GridSpec(3, 3, figure=fig, hspace=0.45, wspace=0.38)

ACCENT  = '#00e5c3'
RED     = '#ff5f5f'
BLUE    = '#4d9fff'
AMBER   = '#f0a500'
SURFACE = '#13161f'
BORDER  = '#252a38'

def style_ax(ax):
    ax.set_facecolor(SURFACE)
    ax.tick_params(colors='#7a8299', labelsize=8)
    ax.xaxis.label.set_color('#7a8299')
    ax.yaxis.label.set_color('#7a8299')
    ax.title.set_color('white')
    for sp in ax.spines.values():
        sp.set_edgecolor(BORDER)

# ── (A) Confusion Matrix ──────────────────────────────────────
ax1 = fig.add_subplot(gs[0, 0])
cm  = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax1,
            xticklabels=['Operational', 'Failure'],
            yticklabels=['Operational', 'Failure'],
            linewidths=1, linecolor=BORDER,
            annot_kws={'size': 13, 'weight': 'bold'})
ax1.set_title('Confusion Matrix', fontweight='bold')
ax1.set_xlabel('Predicted')
ax1.set_ylabel('Actual')
style_ax(ax1)

# ── (B) ROC Curve ─────────────────────────────────────────────
ax2 = fig.add_subplot(gs[0, 1])
fpr, tpr, _ = roc_curve(y_test, y_prob)
ax2.plot(fpr, tpr, color=ACCENT, lw=2, label=f'AUC = {auc:.3f}')
ax2.plot([0,1],[0,1], '--', color='#3a4055', lw=1, label='Random')
ax2.fill_between(fpr, tpr, alpha=0.08, color=ACCENT)
ax2.set_xlabel('False Positive Rate')
ax2.set_ylabel('True Positive Rate')
ax2.set_title('ROC Curve', fontweight='bold')
ax2.legend(fontsize=9, facecolor=SURFACE, edgecolor=BORDER, labelcolor='white')
style_ax(ax2)

# ── (C) Precision-Recall Curve ───────────────────────────────
ax3 = fig.add_subplot(gs[0, 2])
prec, rec, _ = precision_recall_curve(y_test, y_prob)
ax3.plot(rec, prec, color=AMBER, lw=2, label=f'AP = {ap:.3f}')
ax3.axhline(y_test.mean(), ls='--', color='#3a4055', lw=1, label='Baseline')
ax3.fill_between(rec, prec, alpha=0.08, color=AMBER)
ax3.set_xlabel('Recall')
ax3.set_ylabel('Precision')
ax3.set_title('Precision-Recall Curve', fontweight='bold')
ax3.legend(fontsize=9, facecolor=SURFACE, edgecolor=BORDER, labelcolor='white')
style_ax(ax3)

# ── (D) Feature Coefficients ─────────────────────────────────
ax4 = fig.add_subplot(gs[1, :2])
colors = [RED if c > 0 else ACCENT for c in coef_df['Coefficient']]
bars = ax4.barh(coef_df['Feature'], coef_df['Coefficient'],
                color=colors, edgecolor=BORDER, linewidth=0.5, height=0.6)
ax4.axvline(0, color='#3a4055', lw=1)
ax4.set_title('Feature Coefficients (β) — standardised scale', fontweight='bold')
for bar, val in zip(bars, coef_df['Coefficient']):
    x = bar.get_width()
    ax4.text(x + (0.01 if x >= 0 else -0.01), bar.get_y() + bar.get_height()/2,
             f'{val:+.3f}', va='center', ha='left' if x >= 0 else 'right',
             fontsize=8, color='white')
style_ax(ax4)

# ── (E) Probability Distribution ─────────────────────────────
ax5 = fig.add_subplot(gs[1, 2])
ax5.hist(y_prob[y_test == 0], bins=30, alpha=0.7, color=ACCENT,
         label='Operational', density=True, edgecolor=BORDER, lw=0.3)
ax5.hist(y_prob[y_test == 1], bins=30, alpha=0.7, color=RED,
         label='Failure',     density=True, edgecolor=BORDER, lw=0.3)
ax5.axvline(0.5, color=AMBER, ls='--', lw=1.2, label='Threshold 0.5')
ax5.set_xlabel('Predicted failure probability')
ax5.set_ylabel('Density')
ax5.set_title('Predicted Probability Distribution', fontweight='bold')
ax5.legend(fontsize=8, facecolor=SURFACE, edgecolor=BORDER, labelcolor='white')
style_ax(ax5)

# ── (F) Sensor Distributions by class ────────────────────────
ax6 = fig.add_subplot(gs[2, 0])
for label, color, name in [(0, ACCENT, 'Operational'), (1, RED, 'Failure')]:
    ax6.hist(df.loc[df.failure==label, 'temperature'], bins=35,
             alpha=0.65, color=color, label=name, density=True, edgecolor=BORDER, lw=0.3)
ax6.set_xlabel('Temperature (°C)')
ax6.set_title('Temperature by Outcome', fontweight='bold')
ax6.legend(fontsize=8, facecolor=SURFACE, edgecolor=BORDER, labelcolor='white')
style_ax(ax6)

ax7 = fig.add_subplot(gs[2, 1])
for label, color, name in [(0, ACCENT, 'Operational'), (1, RED, 'Failure')]:
    ax7.hist(df.loc[df.failure==label, 'vibration'], bins=35,
             alpha=0.65, color=color, label=name, density=True, edgecolor=BORDER, lw=0.3)
ax7.set_xlabel('Vibration (mm/s)')
ax7.set_title('Vibration by Outcome', fontweight='bold')
ax7.legend(fontsize=8, facecolor=SURFACE, edgecolor=BORDER, labelcolor='white')
style_ax(ax7)

ax8 = fig.add_subplot(gs[2, 2])
for label, color, name in [(0, ACCENT, 'Operational'), (1, RED, 'Failure')]:
    ax8.hist(df.loc[df.failure==label, 'tool_wear'], bins=35,
             alpha=0.65, color=color, label=name, density=True, edgecolor=BORDER, lw=0.3)
ax8.set_xlabel('Tool Wear (%)')
ax8.set_title('Tool Wear by Outcome', fontweight='bold')
ax8.legend(fontsize=8, facecolor=SURFACE, edgecolor=BORDER, labelcolor='white')
style_ax(ax8)

out_path = '"C:/Users/MSharma14/Downloads/logistic_regression_automation.png"'
plt.savefig(out_path, dpi=150, bbox_inches='tight', facecolor='#0b0e14')
print(f"    Saved → {out_path}")

# ─────────────────────────────────────────────────────────────
# 6. EXAMPLE INFERENCE
# ─────────────────────────────────────────────────────────────
print("\n" + "=" * 55)
print("  LIVE INFERENCE — 3 test readings")
print("=" * 55)

scenarios = [
    {"name": "Machine A — healthy",
     "vals": [82, 2.1, 370, 18, 6.8, 17, 50, 1480, 0]},
    {"name": "Machine B — degrading",
     "vals": [115, 9.5, 470, 65, 3.9, 32, 68, 1350, 1]},
    {"name": "Machine C — critical",
     "vals": [142, 18.3, 590, 91, 1.8, 47, 82, 1180, 2]},
]
for s in scenarios:
    x_new  = scaler.transform([s['vals']])
    prob   = model.predict_proba(x_new)[0, 1]
    pred   = model.predict(x_new)[0]
    status = "⚠  FAILURE RISK" if pred else "✓  OPERATIONAL"
    bar    = "█" * int(prob * 20) + "░" * (20 - int(prob * 20))
    print(f"\n  {s['name']}")
    print(f"  [{bar}] {prob:.1%}")
    print(f"  → {status}")

print("\n" + "=" * 55)
print("  DONE")
print("=" * 55)
