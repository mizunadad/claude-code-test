class TargetManager {
  constructor() {
    this.birthDate = "2012-09-04"; // YYYY-MM-DD
    this.fallbackData = this.getFallbackTargets();
    this.targetData = null;
  }

  getFallbackTargets() {
    return {
      13: {
        自由形: {
          50: {
            短水路: { 
              zenchu: {champion: 22.19, final: 22.50, standard: 23.50},
              jo_spring: {champion: 22.19, final: 22.50, standard: 23.50},
              jo_summer: {champion: 23.00, final: 23.50, standard: 24.50}
            },
            長水路: { 
              zenchu: {champion: 23.00, final: 23.30, standard: 24.00}
            }
          },
          100: {
            短水路: { 
              zenchu: {champion: 48.35, final: 49.00, standard: 51.00},
              jo_spring: {champion: 48.33, final: 49.00, standard: 51.00},
              jo_summer: {champion: 49.56, final: 50.50, standard: 52.50}
            },
            長水路: { 
              zenchu: {champion: 49.79, final: 50.50, standard: 52.00}
            }
          },
          200: {
            短水路: { 
              zenchu: {champion: 105.68, final: 108.00, standard: 115.00},
              jo_spring: {champion: 105.16, final: 108.00, standard: 115.00},
              jo_summer: {champion: 108.07, final: 110.00, standard: 118.00}
            },
            長水路: { 
              zenchu: {champion: 108.86, final: 112.00, standard: 120.00}
            }
          }
        },
        バタフライ: {
          50: {
            短水路: { 
              zenchu: {champion: 23.15, final: 24.00, standard: 25.50}
            },
            長水路: { 
              zenchu: {champion: 24.35, final: 25.00, standard: 26.50}
            }
          },
          100: {
            短水路: { 
              zenchu: {champion: 51.38, final: 53.00, standard: 57.00},
              jo_spring: {champion: 50.44, final: 52.00, standard: 55.00},
              jo_summer: {champion: 51.38, final: 53.00, standard: 56.00}
            },
            長水路: { 
              zenchu: {champion: 53.13, final: 55.00, standard: 59.00}
            }
          },
          200: {
            短水路: { 
              zenchu: {champion: 114.78, final: 120.00, standard: 130.00},
              jo_spring: {champion: 110.51, final: 115.00, standard: 125.00},
              jo_summer: {champion: 114.78, final: 120.00, standard: 130.00}
            },
            長水路: { 
              zenchu: {champion: 117.66, final: 125.00, standard: 135.00}
            }
          }
        }
      },
      14: {
        自由形: {
          50: {
            短水路: { 
              zenchu: {champion: 22.00, final: 22.30, standard: 23.30}
            },
            長水路: { 
              zenchu: {champion: 22.80, final: 23.10, standard: 23.80}
            }
          },
          100: {
            短水路: { 
              zenchu: {champion: 48.00, final: 48.70, standard: 50.50}
            },
            長水路: { 
              zenchu: {champion: 49.50, final: 50.20, standard: 51.80}
            }
          },
          200: {
            短水路: { 
              zenchu: {champion: 104.00, final: 106.50, standard: 112.00}
            },
            長水路: { 
              zenchu: {champion: 107.50, final: 110.00, standard: 116.00}
            }
          }
        },
        バタフライ: {
          50: {
            短水路: { 
              zenchu: {champion: 22.80, final: 23.50, standard: 25.00}
            },
            長水路: { 
              zenchu: {champion: 24.00, final: 24.70, standard: 26.00}
            }
          },
          100: {
            短水路: { 
              zenchu: {champion: 50.80, final: 52.20, standard: 56.00}
            },
            長水路: { 
              zenchu: {champion: 52.50, final: 54.00, standard: 58.00}
            }
          },
          200: {
            短水路: { 
              zenchu: {champion: 113.00, final: 118.00, standard: 128.00}
            },
            長水路: { 
              zenchu: {champion: 116.00, final: 122.00, standard: 132.00}
            }
          }
        }
      },
      15: {
        自由形: {
          50: {
            短水路: { 
              zenchu: {champion: 21.80, final: 22.10, standard: 23.00}
            },
            長水路: { 
              zenchu: {champion: 22.60, final: 22.90, standard: 23.60}
            }
          },
          100: {
            短水路: { 
              zenchu: {champion: 47.70, final: 48.40, standard: 50.20}
            },
            長水路: { 
              zenchu: {champion: 49.20, final: 49.90, standard: 51.50}
            }
          },
          200: {
            短水路: { 
              zenchu: {champion: 103.50, final: 106.00, standard: 111.00}
            },
            長水路: { 
              zenchu: {champion: 107.00, final: 109.50, standard: 115.00}
            }
          }
        },
        バタフライ: {
          50: {
            短水路: { 
              zenchu: {champion: 22.60, final: 23.30, standard: 24.80}
            },
            長水路: { 
              zenchu: {champion: 23.80, final: 24.50, standard: 25.80}
            }
          },
          100: {
            短水路: { 
              zenchu: {champion: 50.50, final: 51.90, standard: 55.50}
            },
            長水路: { 
              zenchu: {champion: 52.20, final: 53.70, standard: 57.50}
            }
          },
          200: {
            短水路: { 
              zenchu: {champion: 112.50, final: 117.00, standard: 126.00}
            },
            長水路: { 
              zenchu: {champion: 115.50, final: 121.00, standard: 130.00}
            }
          }
        }
      }
    };
  }

  calculateAge() {
    const today = new Date();
    const birth = new Date(this.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    console.log('Age calculation:', {
      today: today.toISOString(),
      birth: birth.toISOString(),
      calculatedAge: age,
      birthDate: this.birthDate
    });
    
    // テスト用：12歳の場合は13歳として扱う
    if (age === 12) {
      console.log('Age adjusted from 12 to 13 for testing');
      age = 13;
    }
    
    return age;
  }

  async initializeTargets() {
    try {
      console.log('最新目標データを読み込み中...');
      const response = await fetch('./targets/swimming_targets.csv');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const csvText = await response.text();
      console.log('CSV data length:', csvText.length);
      
      this.targetData = this.parseCSV(csvText);
      console.log('最新データ読み込み成功:', Object.keys(this.targetData));
      return this.targetData;
    } catch (error) {
      console.log('最新データ取得失敗、フォールバックデータ使用:', error.message);
      this.targetData = this.fallbackData;
      console.log('フォールバックデータ使用:', Object.keys(this.fallbackData));
      return this.fallbackData;
    }
  }

  parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const data = {};
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const row = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim();
        });
        
        const age = parseInt(row.age);
        const event = row.event;
        const distance = parseInt(row.distance);
        const poolType = row.pool_type;
        const meet = row.meet;
        const level = row.level;
        const timeSeconds = parseFloat(row.time_seconds);
        
        if (!data[age]) data[age] = {};
        if (!data[age][event]) data[age][event] = {};
        if (!data[age][event][distance]) data[age][event][distance] = {};
        if (!data[age][event][distance][poolType]) data[age][event][distance][poolType] = {};
        if (!data[age][event][distance][poolType][meet]) data[age][event][distance][poolType][meet] = {};
        
        data[age][event][distance][poolType][meet][level] = timeSeconds;
      }
    }
    return data;
  }

  getTargetLines(event, distance, poolType) {
    const currentAge = this.calculateAge();
    console.log('getTargetLines called:', { currentAge, event, distance, poolType });
    
    // データ状況をチェック
    console.log('targetData keys:', this.targetData ? Object.keys(this.targetData) : 'null');
    console.log('fallbackData keys:', Object.keys(this.fallbackData));
    
    const ageData = this.targetData?.[currentAge] || this.fallbackData[currentAge];
    console.log('Age data available:', ageData ? Object.keys(ageData) : 'none');
    
    // フォールバックデータを強制的に使用してテスト
    if (!ageData) {
      console.log('Force using fallback data for age 13');
      const testAgeData = this.fallbackData[13];
      if (testAgeData) {
        console.log('Fallback 13 data available:', Object.keys(testAgeData));
        return this.getTargetLinesFromData(testAgeData, event, distance, poolType);
      }
    }
    
    if (!ageData || !ageData[event]) {
      console.log(`目標データが見つかりません: age=${currentAge}, event=${event}`);
      console.log('Available events:', ageData ? Object.keys(ageData) : 'none');
      return [];
    }

    if (!ageData[event][distance]) {
      console.log(`距離データが見つかりません: distance=${distance}`);
      console.log('Available distances:', Object.keys(ageData[event]));
      return [];
    }

    if (!ageData[event][distance][poolType]) {
      console.log(`プールデータが見つかりません: poolType=${poolType}`);
      console.log('Available pool types:', Object.keys(ageData[event][distance]));
      return [];
    }

    return this.getTargetLinesFromData(ageData, event, distance, poolType);
  }

  getTargetLinesFromData(ageData, event, distance, poolType) {
    if (!ageData || !ageData[event] || !ageData[event][distance] || !ageData[event][distance][poolType]) {
      return [];
    }

    const targets = [];
    const eventData = ageData[event][distance][poolType];
    
    Object.entries(eventData).forEach(([meet, levels]) => {
      Object.entries(levels).forEach(([level, time]) => {
        targets.push({
          meet,
          level, 
          time: parseFloat(time),
          label: `${this.getMeetLabel(meet)}_${this.getLevelLabel(level)}`,
          color: this.getLineColor(meet, level),
          style: this.getLineStyle(level)
        });
      });
    });

    targets.sort((a, b) => a.time - b.time);
    console.log('Generated target lines:', targets);
    return targets;
  }

  getMeetLabel(meet) {
    const labels = {
      zenchu: '全中',
      jo_spring: 'JO春',
      jo_summer: 'JO夏'
    };
    return labels[meet] || meet;
  }

  getLevelLabel(level) {
    const labels = {
      champion: '優勝',
      final: '決勝',
      standard: '標準'
    };
    return labels[level] || level;
  }

  getLineColor(meet, level) {
    const meetColors = {
      zenchu: {
        champion: '#DC2626', // 濃い赤
        final: '#EF4444',    // 中間赤
        standard: '#F87171'  // 薄い赤
      },
      jo_spring: {
        champion: '#059669', // 濃い緑
        final: '#10B981',    // 中間緑
        standard: '#34D399'  // 薄い緑
      },
      jo_summer: {
        champion: '#2563EB', // 濃い青
        final: '#3B82F6',    // 中間青
        standard: '#60A5FA'  // 薄い青
      }
    };
    return meetColors[meet]?.[level] || '#6B7280';
  }

  getLineStyle(level) {
    const styles = {
      champion: { lineStyle: 'solid', width: 3, opacity: 0.9 },
      final: { lineStyle: 'dashed', width: 2.5, opacity: 0.8 },
      standard: { lineStyle: 'dotted', width: 2, opacity: 0.7 }
    };
    return styles[level] || styles.standard;
  }

  formatTime(seconds) {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = (seconds % 60).toFixed(2);
      return `${minutes}:${remainingSeconds.padStart(5, '0')}`;
    }
    return seconds.toFixed(2);
  }

  getCurrentAge() {
    return this.calculateAge();
  }

  getAvailableEvents() {
    const currentAge = this.calculateAge();
    const ageData = this.targetData?.[currentAge] || this.fallbackData[currentAge];
    return ageData ? Object.keys(ageData) : [];
  }

  getAvailableDistances(event) {
    const currentAge = this.calculateAge();
    const ageData = this.targetData?.[currentAge] || this.fallbackData[currentAge];
    return ageData?.[event] ? Object.keys(ageData[event]).map(d => parseInt(d)) : [];
  }

  getAvailablePoolTypes(event, distance) {
    const currentAge = this.calculateAge();
    const ageData = this.targetData?.[currentAge] || this.fallbackData[currentAge];
    return ageData?.[event]?.[distance] ? Object.keys(ageData[event][distance]) : [];
  }
}

if (typeof window !== 'undefined') {
  window.targetManager = new TargetManager();
}