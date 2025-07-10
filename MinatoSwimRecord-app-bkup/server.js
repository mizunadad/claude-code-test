const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, 'data', 'swim-records.json');

async function readRecords() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading records:', error);
        return { records: [], metadata: { totalRecords: 0 } };
    }
}

async function writeRecords(data) {
    try {
        data.metadata.lastUpdated = new Date().toISOString();
        data.metadata.totalRecords = data.records.length;
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing records:', error);
        return false;
    }
}

function generateId(records) {
    if (records.length === 0) return '001';
    const maxId = Math.max(...records.map(r => parseInt(r.id)));
    return String(maxId + 1).padStart(3, '0');
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/records', async (req, res) => {
    try {
        const data = await readRecords();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read records' });
    }
});

app.post('/api/records', async (req, res) => {
    try {
        const data = await readRecords();
        const newRecord = {
            ...req.body,
            id: generateId(data.records),
            更新日時: new Date().toISOString()
        };
        
        data.records.push(newRecord);
        
        const success = await writeRecords(data);
        if (success) {
            res.json({ success: true, record: newRecord });
        } else {
            res.status(500).json({ error: 'Failed to save record' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to add record' });
    }
});

app.put('/api/records/:id', async (req, res) => {
    try {
        const data = await readRecords();
        const recordId = req.params.id;
        const recordIndex = data.records.findIndex(r => r.id === recordId);
        
        if (recordIndex === -1) {
            return res.status(404).json({ error: 'Record not found' });
        }
        
        data.records[recordIndex] = {
            ...data.records[recordIndex],
            ...req.body,
            id: recordId,
            更新日時: new Date().toISOString()
        };
        
        const success = await writeRecords(data);
        if (success) {
            res.json({ success: true, record: data.records[recordIndex] });
        } else {
            res.status(500).json({ error: 'Failed to update record' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update record' });
    }
});

app.delete('/api/records/:index', async (req, res) => {
    try {
        const data = await readRecords();
        const index = parseInt(req.params.index);
        
        if (index < 0 || index >= data.records.length) {
            return res.status(404).json({ error: 'Record not found' });
        }
        
        data.records.splice(index, 1);
        
        const success = await writeRecords(data);
        if (success) {
            res.json({ success: true });
        } else {
            res.status(500).json({ error: 'Failed to delete record' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete record' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const data = await readRecords();
        const records = data.records;
        
        const totalRecords = records.length;
        const competitions = [...new Set(records.map(r => r.大会名))].filter(c => c).length;
        const firstPlaces = records.filter(r => r.順位 === '1位').length;
        
        const butterflyRecords = records.filter(r => 
            r.種目 === 'バタフライ' && r.距離 === '50'
        );
        
        let bestTime = null;
        if (butterflyRecords.length > 0) {
            bestTime = Math.min(...butterflyRecords.map(r => parseFloat(r.タイム)));
        }
        
        const recentRecords = records
            .sort((a, b) => new Date(b.日付) - new Date(a.日付))
            .slice(0, 5);
        
        const strokeStats = {};
        records.forEach(record => {
            const stroke = record.種目;
            if (!strokeStats[stroke]) {
                strokeStats[stroke] = 0;
            }
            strokeStats[stroke]++;
        });
        
        res.json({
            totalRecords,
            competitions,
            firstPlaces,
            bestTime,
            recentRecords,
            strokeStats
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to calculate stats' });
    }
});

app.get('/api/search', async (req, res) => {
    try {
        const { stroke, distance, pool, dateFrom, dateTo } = req.query;
        const data = await readRecords();
        let filteredRecords = data.records;
        
        if (stroke) {
            filteredRecords = filteredRecords.filter(r => r.種目 === stroke);
        }
        
        if (distance) {
            filteredRecords = filteredRecords.filter(r => r.距離 === distance);
        }
        
        if (pool) {
            filteredRecords = filteredRecords.filter(r => r.プール === pool);
        }
        
        if (dateFrom) {
            filteredRecords = filteredRecords.filter(r => r.日付 >= dateFrom);
        }
        
        if (dateTo) {
            filteredRecords = filteredRecords.filter(r => r.日付 <= dateTo);
        }
        
        res.json({ records: filteredRecords });
    } catch (error) {
        res.status(500).json({ error: 'Failed to search records' });
    }
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        app: 'MinatoSwimRecord',
        version: '1.0.0'
    });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

async function initializeServer() {
    try {
        await fs.access(path.join(__dirname, 'data'));
    } catch {
        await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
    }
    
    try {
        await fs.access(DATA_FILE);
        console.log('✅ Data file found');
    } catch {
        console.log('⚠️  Data file not found, will be created on first write');
    }
    
    app.listen(PORT, () => {
        console.log(`🏊‍♂️ MinatoSwimRecord Server is running on port ${PORT}`);
        console.log(`📊 Access the app at: http://localhost:${PORT}`);
        console.log(`🔧 Health check: http://localhost:${PORT}/health`);
        console.log(`📁 Data file: ${DATA_FILE}`);
    });
}

initializeServer().catch(console.error);