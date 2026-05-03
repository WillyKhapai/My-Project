
import matplotlib.pyplot as plt
import numpy as np

# Generate data
x = np.linspace(0, 10, 200)
y1 = np.sin(x) * np.exp(-0.1 * x)
y2 = np.cos(x) * np.exp(-0.1 * x)

# Create figure
fig, ax = plt.subplots(figsize=(8, 5))

ax.plot(x, y1, color='#2563eb', linewidth=2, label='Damped Sine')
ax.plot(x, y2, color='#f59e0b', linewidth=2, label='Damped Cosine')
ax.fill_between(x, y1, y2, alpha=0.1, color='#8b5cf6')

ax.set_title('Damped Oscillations', fontsize=16, fontweight='bold', pad=12)
ax.set_xlabel('Time (s)', fontsize=12)
ax.set_ylabel('Amplitude', fontsize=12)
ax.legend(fontsize=11, loc='upper right')
ax.grid(True, alpha=0.3)
ax.set_facecolor('#fafafa')
fig.tight_layout()

plt.show()
