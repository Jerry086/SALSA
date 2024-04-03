# dependencies: resampy, tensorflow, tf_slim, soundfile
import tensorflow.compat.v1 as tf
import numpy as np
import vggish_postprocess
import vggish_input
import vggish_slim
import vggish_params


class VGGish:
    def __init__(self):
        tf.disable_eager_execution()
        self.sess = tf.Session()
        vggish_slim.define_vggish_slim(training=False)
        vggish_slim.load_vggish_slim_checkpoint(self.sess, "./model/vggish_model.ckpt")
        self.features_tensor = self.sess.graph.get_tensor_by_name(
            vggish_params.INPUT_TENSOR_NAME
        )
        self.embedding_tensor = self.sess.graph.get_tensor_by_name(
            vggish_params.OUTPUT_TENSOR_NAME
        )
        # restore PCA parameters
        self.pproc = vggish_postprocess.Postprocessor("./model/vggish_pca_params.npz")

    def get_embedding(self, wavfile):
        examples_batch = vggish_input.wavfile_to_examples(wavfile)
        [embedding_batch] = self.sess.run(
            [self.embedding_tensor], feed_dict={self.features_tensor: examples_batch}
        )
        postprocessed_batch = self.pproc.postprocess(embedding_batch)
        mean_pooled_batch = np.mean(postprocessed_batch, axis=0)
        return mean_pooled_batch

    def __del__(self):
        self.sess.close()
