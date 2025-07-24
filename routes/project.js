const express = require('express');
const multer = require('multer');
const Project = require('../models/project');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });
const multiUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'screenshots', maxCount: 5 },
]);

router.post('/add', multiUpload, async (req, res) => {
  try {
    const { title, subcontent, body, customDate, liveUrl } = req.body;
    const languages = req.body.languages ? JSON.parse(req.body.languages) : [];

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    const imageFile = req.files?.image?.[0];
    const screenshotFiles = req.files?.screenshots || [];

    const image = imageFile
      ? {
          data: imageFile.buffer.toString('base64'),
          contentType: imageFile.mimetype,
        }
      : null;

    const screenshots = screenshotFiles.map((file) => ({
      data: file.buffer.toString('base64'),
      contentType: file.mimetype,
    }));

    const newProject = new Project({
      title,
      subcontent,
      body,
      image,
      screenshots,
      customDate: customDate ? new Date(customDate) : undefined,
      languages,
      liveUrl,
    });

    await newProject.save();
    res.status(201).json({ message: 'Project created successfully', project: newProject });
    console.log(req.files.screenshots.length)
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Error creating project', message: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 })
      .allowDiskUse(true);
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Error fetching projects', message: error.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Error fetching project', message: error.message });
  }
});


router.put('/update/:id', multiUpload, async (req, res) => {
  try {
    const { title, subcontent, body, customDate, liveUrl } = req.body;
    const languages = req.body.languages ? JSON.parse(req.body.languages) : undefined;

    const imageFile = req.files?.image?.[0];
    const screenshotFiles = req.files?.screenshots;

    const image = imageFile
      ? {
          data: imageFile.buffer.toString('base64'),
          contentType: imageFile.mimetype,
        }
      : undefined;

    const screenshots = screenshotFiles
      ? screenshotFiles.map((file) => ({
          data: file.buffer.toString('base64'),
          contentType: file.mimetype,
        }))
      : undefined;

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        title,
        subcontent,
        body,
        ...(image && { image }),
        ...(screenshots && { screenshots }),
        ...(customDate && { customDate: new Date(customDate) }),
        ...(languages && { languages }),
        ...(liveUrl && { liveUrl }),
      },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project updated successfully', project: updatedProject });
    console.log(req.files.screenshots.length)
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Error updating project', message: error.message });
  }
});

// DELETE Project
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Error deleting project', message: error.message });
  }
});

module.exports = router;